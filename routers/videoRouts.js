const router = require('express').Router();

const videoController = require('../controllers/videoConroller');
const { protect } = require('../middleware/verifyToken');

router.post('/uploadVideo', videoController.uploadVideo);
router.post('/getVideo', videoController.getVideo);

router.get('/getAllVideos', videoController.getAllVideos);
router.use(protect);

router.delete('/deleteVideo/:videoId', videoController.deleteVideo);
//router.get('/analyzeVideo/:videourl', videoController.analyzeVideo);
module.exports = router;
