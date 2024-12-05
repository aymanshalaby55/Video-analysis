const express = require("express");

const router = express.Router();
const aiCallController = require("../controllers/aiCallController");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");

router.post("/addVideosToQueue", aiCallController.addVideosToQueue);

module.exports = router;
