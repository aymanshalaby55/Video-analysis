const router = require('express').Router();

const videoController = require('../controllers/videoConroller');
const { protect } = require('../middleware/verifyToken');

router.get('/getVideo', videoController.getVideo);

router.use(protect);
router.get('/getAllVideos?', videoController.getAllVideos);
router.post('/uploadVideo', videoController.uploadVideo);
<<<<<<< HEAD
router.get('/getVideo', videoController.getVideo);
=======

>>>>>>> aafe13b08abcb13d5a087d25beb7a48c926670f1

router.delete('/deleteVideo/:videoId', videoController.deleteVideo);
//router.get('/analyzeVideo/:videourl', videoController.analyzeVideo);
module.exports = router;
