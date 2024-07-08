const cloudinary = require('cloudinary');
const multer = require('multer');
const CatchAsync = require('express-async-handler');
const path = require('path');
const fs = require('fs');


const Video = require('../models/videoModel');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: './AllVideos',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Define how the uploaded files should be named
  },
});

function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /mp4|mkv|mov|avi/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  console.log(extname);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Videos Only!');
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('Video');


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
        const videoPath = `uploads/${req.file.filename}`;
        const newVideo = await Video.create({
          videoPath,
        });
        console.log(req.user);
        await User.findByIdAndUpdate(req.user._id, {
          $push: { videos: newVideo._id },
        });

        if (req.file == undefined) {
          res.status(400).send({ message: 'No file selected!' });
        } else {
          res.send({
            message: 'File uploaded!',
            file: `AllVideos/${req.file.path}`
          });
        }
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
// test
exports.getVideo = ((req, res, next) => {
  console.log("here")
  const videoPath = path.resolve(__dirname, 'D:/Programming/Graduation Project/Video-analysis/AllVideos/Video-1720198893298.mp4');
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});


exports.getAllVideos = CatchAsync(async (req, res, next) => {
  const { user } = req;
  console.log('User before population:');

  console.log(user.videos)
  await user.populate('videos');
  const features = new APIFeatures(Video.find({ _id: { $in: user.videos.map(video => video._id) } }), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const filteredVideos = await features.query;
  console.log('Populated videos:', filteredVideos);

  if (!filteredVideos || filteredVideos.length === 0) {
    return res.status(404).json({ message: 'No videos found for this user.' });
  }

  res.status(200).json({ videos: filteredVideos });
});


exports.deleteVideo = CatchAsync(async (req, res, next) => {
  const videoId = req.params.videoId;
  const { user } = req;
  console.log(videoId);

  // Corrected query to find the video by videoPath
  const video = await Video.findById({_id:videoId});
  console.log(video);
  
  if (video) {
    const videoFilePath = 'D:/x.mp4';
    console.log(videoFilePath);
    await fs.unlink(videoFilePath, async (err) => {
      if (err) {
        console.error(`Failed to delete video file: ${err}`);
        return res.status(500).json({ message: 'Failed to delete video file' });
      } else {
        console.log(`Video file ${video.videoPath} deleted successfully`);
        
        // Remove video from Video model
        await Video.findByIdAndDelete(videoId);
        
        // Remove video from user's videos array
        user.videos = user.videos.filter(v => v.toString() !== videoId);
        await user.save();
        
        res.status(200).json({ message: 'Video deleted successfully' });
      }
    });
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
});

// exports.getAllVideos = CatchAsync(async (req, res, next) => {
//   const { user } = req;

//   const { videos } = await user.populate({
//     path: 'videos',
//   });

//   res.status(200).json(videos);
// });
