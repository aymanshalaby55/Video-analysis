const Router = require('express').Router();

const videoController = require('../controllers/videoConroller');

Router.post('/uploadVideo' , videoController.uploadVideo);

module.exports = Router;
