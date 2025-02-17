const CatchAsync = require("express-async-handler");
const fs = require("fs");
const util = require("util");
const path = require("path");
const {
  uploadMiddleware,
  videoUploadQueue,
} = require("../services/videoUploadService");

const Video = require("../models/videoModel");
const User = require("../models/userModel");

// Promisify fs functions we need
const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);

exports.uploadVideo = CatchAsync(async (req, res, next) => {
  uploadMiddleware(req, res, async (uploadError) => {
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
      // Queue jobs for each video
      const uploadJobs = req.files.map((file) => {
        const jobData = {
          userId: user._id,
          file: {
            originalname: file.originalname,
            buffer: file.buffer,
            fieldname: file.fieldname,
            size: file.size,
          },
          storageLimit: newStorageLimit,
        };

        return videoUploadQueue.add(jobData, {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        });
      });

      res.status(200).json({
        message: "Videos have been queued for processing",
        uploadJobs: uploadJobs.map((job) => job.id),
      });
    } catch (error) {
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
      fs.promises
        .access(videoPath)
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
