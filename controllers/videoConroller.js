/* eslint-disable no-restricted-syntax */
/* eslint-disable no-else-return */
/* eslint-disable prefer-template */
const cloudinary = require("cloudinary");
const multer = require("multer");
const CatchAsync = require("express-async-handler");
const path = require("path");
const fs = require("fs");

const Video = require("../models/videoModel");
const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const { extractFirstFrame } = require("../utils/GetFrame");
const Frame = require("../models/frameModel");

// variables
const FramePath = "F:/Programming/Final/api/public/Frames";

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: "./public/AllVideos",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    ); // Define how the uploaded files should be named
  },
});

function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /mp4|mkv|mov|avi/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype); // search for it

  console.log(extname);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only!");
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("videoPath");

exports.uploadVideo = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      try {
        if (err) {
          console.log(err);
          return res
            .status(400)
            .json({ message: "Video upload failed", error: err });
        }

        if (!req.file || !req.file.path) {
          return res.status(400).json({ message: "No video uploaded" });
        }
        const videoPath = `public/AllVideos/${req.file.filename}`;
        const savedFramePath = extractFirstFrame(videoPath, FramePath);
        console.log(savedFramePath);

        const newVideo = await Video.create({
          videoPath,
        });
        const newFrame = await Frame.create({
          video: newVideo,
          framePath: savedFramePath,
        });
        await User.findByIdAndUpdate(req.user._id, {
          $push: { videos: newVideo._id },
        });

        res.send({
          message: "File uploaded!",
          file: `AllVideos/${req.file.path}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          error,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};

exports.streamVideos = async (req, res, next) => {
  try {
    const videoIds = req.params.videoIds.split(","); // Assuming videoIds are passed as a URL parameter and split into an array
    console.log(videoIds);
    const videos = await Video.find({ _id: { $in: videoIds } });
    if (videos.length === 0) {
      return res.status(404).send("Videos not found");
    }

    const videoPaths = videos.map((video) =>
      path.resolve(__dirname, `../${video.videoPath}`),
    );

    for (const videoPath of videoPaths) {
      if (!fs.existsSync(videoPath)) {
        return res.status(404).send("One or more video files not found");
      }
    }

    let videoIndex = 0;
    const videoStat = await fs.promises.stat(videoPaths[videoIndex]);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    const streamNextVideo = (start) => {
      if (videoIndex >= videoPaths.length) {
        res.end();
        return;
      }

      const videoPath = videoPaths[videoIndex];
      const file = fs.createReadStream(videoPath, { start });

      file.on("end", () => {
        videoIndex += 1;
        streamNextVideo(0);
      });
      console.log("hello");
      file.pipe(res, { end: false });
    };

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res
          .status(416)
          .send(
            "Requested range not satisfiable\n" + start + " >= " + fileSize,
          );
        return;
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
  } catch (error) {
    console.error("Error streaming videos:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAllVideos = CatchAsync(async (req, res, next) => {
  const videos = await Video.find();
  res.status(200).json({
    status: "success",
    results: videos.length,
    data: {
      videos,
    },
  });
});

exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const videoId = req.params.videoId;
  const { user } = req;
  console.log(videoId);

  // Corrected query to find the video by videoPath
  const video = await Video.findById({ _id: videoId });
  console.log(video);

  if (video) {
    const videoFilePath = "D:/x.mp4";
    console.log(videoFilePath);
    await fs.unlink(videoFilePath, async (err) => {
      if (err) {
        console.error(`Failed to delete video file: ${err}`);
        return res.status(500).json({ message: "Failed to delete video file" });
      } else {
        console.log(`Video file ${video.videoPath} deleted successfully`);

        // Remove video from Video model
        await Video.findByIdAndDelete(videoId);

        // Remove video from user's videos array
        user.videos = user.videos.filter((v) => v.toString() !== videoId);
        await user.save();

        res.status(200).json({ message: "Video deleted successfully" });
      }
    });
  } else {
    res.status(404).json({ message: "Video not found" });
  }
});

// exports.getAllVideos = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   const { videos } = await user.populate({
//     path: 'videos',
//   });

//   res.status(200).json(videos);
// });
