const express = require('express');
const router = express.Router();
const aiCallController = require('../controllers/aiCallController');
const { protect, verifyTokenAndAdmin } = require('../middleware/verifyToken');

router.get('/analyzeModel', aiCallController.analyzeVideo);

module.exports = router;
