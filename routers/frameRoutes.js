const express = require("express");
const router = express.Router();
const frameController = require("../controllers/FrameController");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");

// router.use(protect);

router.route("/getAllFrames").get(frameController.getAllFrames);

router
  .route("/:id")
  .get(frameController.getFrame)
  .delete(frameController.deleteFrame);

module.exports = router;
