const cloudinary = require('cloudinary');
const multer = require("multer");


const Video = require('./../models/videoModel');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Define how the uploaded files should be named
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
}).single("videoUrl");

exports.uploadVideo = async (req, res) => {
    try {
      upload(req, res, async (err) => {
        try {
          if (err) {
            return res
              .status(400)
              .json({ message: "Video upload failed", error: err });
          }
  
          if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "No video uploaded" });
          }
  
          const uploadedVideo = await cloudinary.v2.uploader.upload(
            req.file.path,
            {
              resource_type: "video",
              folder: "videos",
            }
          );
  
          const { secure_url: videoUrl } = uploadedVideo;
  
     
  
          const newVideo= await Video.create({
            videoUrl,
          });
  
          return res.status(201).json(newVideo);
        } catch (error) {
          return res.status(500).json({
            error,
          });
        }
      });
    } catch (error) {
      return res.status(500).json({ error: "An internal server error occurred" });
    }
  };