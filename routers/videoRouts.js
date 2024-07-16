const router = require("express").Router();

const videoController = require("../controllers/videoConroller");
const { protect, verifyTokenAndAdmin } = require("../middleware/verifyToken");

router.get("/streamVideo/:videoIds", videoController.streamVideos);

router.use(protect);
router.get("/getAllVideos", verifyTokenAndAdmin, videoController.getAllVideos);
router.post("/uploadVideo", videoController.uploadVideo);
// router.get('/getVideo', videoController.getVideo);

router.delete("/deleteVideo/:videoId", videoController.deleteVideo);
//router.get('/analyzeVideo/:videourl', videoController.analyzeVideo);
module.exports = router;
