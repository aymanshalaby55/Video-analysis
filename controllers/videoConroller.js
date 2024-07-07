const cloudinary = require('cloudinary');
const multer = require('multer');
const CatchAsync = require('express-async-handler');
const path = require('path');

const Video = require('../models/videoModel');
const User = require('../models/userModel');

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

        // const uploadedVideo = await cloudinary.v2.uploader.upload(
        //   req.file.path,
        //   {
        //     resource_type: 'video',
        //     folder: 'videos',
        //   },
        // );

        const videoPath = req.file.path;

        const newVideo = await Video.create({
          videoPath,
        });

        // await User.findByIdAndUpdate(req.user._id, {
        //   $push: { videos: newVideo._id },
        // });else {
        if (req.file == undefined) {
          res.status(400).send({ message: 'No file selected!' });
        } else {
          res.send({
            message: 'File uploaded!',
            file: `uploads/${req.file.path}`
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
exports.getVideo = ((req, res , next) => {
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

  const { videos } = await user.populate({
    path: 'videos',
  });

  res.status(200).json(videos);
});
