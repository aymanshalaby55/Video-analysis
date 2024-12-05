const multer = require("multer");
const fs = require("fs");
const util = require("util");
const path = require("path");
const Queue = require("bull");
const Video = require("../models/videoModel");
const User = require("../models/userModel");

// Constants
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = /mp4|mkv|mov|avi/;
const VIDEO_STORAGE_PATH = "./public/AllVideos";

// Create video upload queue
const videoUploadQueue = new Queue("video-uploads", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Promisify fs functions
const mkdir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const access = util.promisify(fs.access);

// Configure Multer storage
const storage = multer.memoryStorage();

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
}).array("videoPath", 10);

// Process video upload jobs
videoUploadQueue.process(async (job) => {
  const { userId, file, storageLimit } = job.data;

  try {
    // Ensure storage directory exists
    try {
      await access(VIDEO_STORAGE_PATH);
    } catch (err) {
      if (err.code === "ENOENT") {
        await mkdir(VIDEO_STORAGE_PATH, { recursive: true });
      } else {
        throw err;
      }
    }
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `videoPath-${timestamp}`;
    const filepath = path.join(VIDEO_STORAGE_PATH, filename);
    // Save file to disk
    await writeFile(filepath, Buffer.from(file.buffer));

    // Create video document
    const video = await Video.create({
      originalName: file.originalname,
      videoPath: filename,
      videoSize: file.size,
      user: userId,
    });

    // Update user storage limit
    await User.findByIdAndUpdate(userId, {
      $inc: { storageLimit: -file.size },
      $push: { videos: video._id },
    });

    return {
      status: "success",
      video,
    };
  } catch (error) {
    console.error("Error in video upload job:", error);
    throw error;
  }
});

// Handle completed jobs
videoUploadQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle failed jobs
videoUploadQueue.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

// Export the upload middleware and queue
module.exports = {
  uploadMiddleware: upload,
  videoUploadQueue,
};
