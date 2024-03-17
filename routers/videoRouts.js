const router = require('express').Router();

const videoController = require('../controllers/videoConroller');
const { protect } = require('../middleware/verifyToken');

router.use(protect);

router.get('/getAllVideos', videoController.getAllVideos);
router.post('/uploadVideo', videoController.uploadVideo);
router.delete('/deleteVideo/:videoId', videoController.deleteVideo);

module.exports = router;
