const multer = require("multer");
const fs = require("fs");
const util = require("util");
const path = require("path");
const CatchAsync = require("express-async-handler");

const Video = require("../models/videoModel");
const User = require("../models/userModel");

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = /mp4|mkv|mov|avi/;
const VIDEO_STORAGE_PATH = "./public/AllVideos";

// Configure Multer storage
const storage = multer.memoryStorage();

// Promisify fs functions we need
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const stat = util.promisify(fs.stat);
const access = util.promisify(fs.access);

// File type and size validator
const fileFilter = (req, file, cb) => {
  const isValidExtension = ALLOWED_VIDEO_TYPES.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const isValidMimeType = ALLOWED_VIDEO_TYPES.test(file.mimetype);

  if (isValidExtension && isValidMimeType) {
    return cb(null, true);
  }

  cb(new Error("Invalid file type. Only video files are allowed."));
};

// Multer upload configuration
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).array("videoPath", 5); // Allow up to 5 videos to be uploaded at once

exports.uploadVideo = CatchAsync(async (req, res, next) => {
  upload(req, res, async (uploadError) => {
    // Handle multer upload errors
    if (uploadError) {
      return res.status(400).json({
        message: uploadError.message || "Video upload failed",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No videos uploaded",
      });
    }

    const { user } = req;
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const newStorageLimit = user.storageLimit - totalSize;

    // Check storage limit
    if (newStorageLimit < 0) {
      return res.status(400).json({
        message: "Storage limit exceeded. Please upgrade for more storage.",
      });
    }

    try {
      // Ensure storage directory exists
      await mkdir(VIDEO_STORAGE_PATH, { recursive: true });

      // Process each uploaded file
      const uploadedVideos = await Promise.all(
        req.files.map(async (file) => {
          // Generate unique filename
          const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
          const videoPath = path.join(VIDEO_STORAGE_PATH, filename);

          // Write file to disk
          await writeFile(videoPath, file.buffer);

          // Create video record in database
          return await Video.create({ videoPath });
        }),
      );

      // Update user's videos and storage limit
      await User.findByIdAndUpdate(user._id, {
        $push: { videos: { $each: uploadedVideos.map((video) => video._id) } },
        storageLimit: newStorageLimit,
      });

      res.status(201).json({
        message: "Videos uploaded successfully",
        videos: uploadedVideos.map((video) => video._id),
        limitStorage: newStorageLimit,
      });
    } catch (error) {
      // Clean up files if an error occurs
      await Promise.all(
        req.files.map(async (file) => {
          try {
            const filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
            const videoPath = path.join(VIDEO_STORAGE_PATH, filename);
            await unlink(videoPath);
          } catch (unlinkError) {
            console.error("Failed to delete temporary file:", unlinkError);
          }
        }),
      );

      next(error);
    }
  });
});

exports.streamVideos = CatchAsync(async (req, res, next) => {
  const videoIds = req.params.videoIds.split(",");

  // Find videos in database
  const videos = await Video.find({ _id: { $in: videoIds } });
  if (videos.length === 0) {
    return res.status(404).json({ message: "Videos not found" });
  }

  // Resolve full paths and check file existence
  const videoPaths = videos.map((video) =>
    path.resolve(__dirname, `../${video.videoPath}`),
  );

  const videoExists = await Promise.all(
    videoPaths.map((videoPath) =>
      access(videoPath)
        .then(() => true)
        .catch(() => false),
    ),
  );

  if (videoExists.includes(false)) {
    return res
      .status(404)
      .json({ message: "One or more video files not found" });
  }

  let videoIndex = 0;
  const videoStat = await stat(videoPaths[videoIndex]);
  const fileSize = videoStat.size;
  const { range } = req.headers;

  const streamNextVideo = (start) => {
    if (videoIndex >= videoPaths.length) {
      return res.end();
    }

    const videoPath = videoPaths[videoIndex];
    const file = fs.createReadStream(videoPath, { start });

    file.on("end", () => {
      videoIndex += 1;
      streamNextVideo(0);
    });

    file.pipe(res, { end: false });
  };

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      return res.status(416).json({
        message: "Requested range not satisfiable",
        start,
        fileSize,
      });
    }

    const chunksize = end - start + 1;
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    streamNextVideo(start);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    streamNextVideo(0);
  }
});

exports.getAllVideos = CatchAsync(async (req, res) => {
  const videos = await Video.find();

  res.status(200).json({
    status: "success",
    results: videos.length,
    data: { videos },
  });
});

exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const { user } = req;

  // Find the video
  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    // Delete video file from disk
    await unlink(video.videoPath);

    // Remove video from Video model
    await Video.findByIdAndDelete(videoId);

    // Remove video from user's videos array
    user.videos = user.videos.filter((v) => v.toString() !== videoId);
    await user.save();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);

    if (error.code === "ENOENT") {
      // File not found error - still proceed with database cleanup
      await Video.findByIdAndDelete(videoId);
      user.videos = user.videos.filter((v) => v.toString() !== videoId);
      await user.save();
    }

    next(error);
  }
});
