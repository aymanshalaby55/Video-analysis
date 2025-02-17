const router = require("express").Router();

const videoController = require("../controllers/videoConroller");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");
const filesSizeValidation = require("../middleware/filesSizeValidation");

router.get("/streamVideo/:videoIds", videoController.streamVideos);

router.use(protect);
router.get("/getAllVideos", protect, videoController.getAllVideos);
router.post("/uploadVideo", videoController.uploadVideo);
// router.get('/getVideo', videoController.getVideo);

router.delete("/deleteVideo/:videoId", videoController.deleteVideo);
//router.get('/analyzeVideo/:videourl', videoController.analyzeVideo);
module.exports = router;
