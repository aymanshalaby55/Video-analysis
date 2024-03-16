const Router = require('express').Router();

const videoController = require('../controllers/videoConroller');
const { protect } = require('../middleware/verifyToken');

Router.post('/uploadVideo', protect, videoController.uploadVideo);

module.exports = Router;
