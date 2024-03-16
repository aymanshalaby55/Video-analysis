const express = require('express');

const router = express.Router();
const { verifyTokenAndAdmin } = require('../middleware/verifyToken');

const {
  register,
  login,
  logout,
  getAllUsers,
} = require('../controllers/userControllers');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
// router.get("/", verifyTokenAndAdmin, getAllUsers);

module.exports = router;
