const express = require('express');

const router = express.Router();
const { verifyTokenAndAdmin, protect } = require('../middleware/verifyToken');

const {
  register,
  login,
  logout,
  getAllUsers,
  getAllVideos,
} = require('../controllers/userControllers');

router.post('/register', register);
router.post('/login', login);

// router.get('/', verifyTokenAndAdmin, getAllUsers);
router.use(protect);
router.post('/logout', logout);

module.exports = router;
