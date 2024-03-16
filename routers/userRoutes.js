const express = require('express');

const router = express.Router();
const { verifyTokenAndAdmin, protect } = require('../middleware/verifyToken');

const {
  register,
  login,
  logout,
  getAllVideos,
} = require('../controllers/userControllers');

router.post('/register', register);
router.post('/login', login);
router.use(protect);

router.post('/logout', logout);

router.get('/getAllvideos', getAllVideos);
// router.get('/', verifyTokenAndAdmin, getAllUsers);

module.exports = router;
