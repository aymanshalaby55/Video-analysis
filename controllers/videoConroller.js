const cloudinary = require('cloudinary');
const multer = require('multer');
const CatchAsync = require('express-async-handler');

const Video = require('../models/videoModel');
const User = require('../models/userModel');

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
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
}).single('videoUrl');

exports.uploadVideo = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      try {
        if (err) {
          return res
            .status(400)
            .json({ message: 'Video upload failed', error: err });
        }

        if (!req.file || !req.file.path) {
          return res.status(400).json({ message: 'No video uploaded' });
        }

        const uploadedVideo = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            resource_type: 'video',
            folder: 'videos',
          },
        );

        const { secure_url: videoUrl } = uploadedVideo;

        const newVideo = await Video.create({
          videoUrl,
        });

        await User.findByIdAndUpdate(req.user._id, {
          $push: { videos: newVideo._id },
        });

        return res.status(201).json(newVideo);
      } catch (error) {
        return res.status(500).json({
          error,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'An internal server error occurred' });
  }
};

exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const { user } = req;

  const video = await Video.findByIdAndDelete(videoId);

  const deleteUserVideo = await User.findByIdAndUpdate(user._id, {
    $pull: { videos: videoId },
  });

  // delete video form video collection
  console.log(user);

  res.status(200).json({
    status: 'success',
    videos: user.videos,
  });
});

exports.getAllVideos = CatchAsync(async (req, res, next) => {
  const { user } = req;
  console.log('User before population:', user);

  await user.populate({ path: 'videos' });
  console.log('Populated videos:', user.videos);

  if (!user.videos || user.videos.length === 0) {
    return res.status(404).json({ message: 'No videos found for this user.' });
  }

  res.status(200).json({ videos: user.videos });
});

exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const { videoId } = req.params;
  const { user } = req;

  const video = await Video.findByIdAndDelete(videoId);

  const deleteUserVideo = await User.findByIdAndUpdate(user._id, {
    $pull: { videos: videoId },
  });

  // delete video form video collection
  console.log(user);

  res.status(200).json({
    status: 'success',
    videos: user.videos,
  });
});

exports.getAllVideos = CatchAsync(async (req, res, next) => {
  const { user } = req;
  // console.log(user);

  // const { videos } = await user.populate({
  //   path: 'videos',
  // });
  const users = await User.findById({ _id: user._id });
  console.log(users);
  res.status(200).json({
    status: 'success',
  });
});
