const express = require('express');

const router = express.Router();
const { verifyTokenAndAdmin, protect } = require('../middleware/verifyToken');

const userConrtollers = require('../controllers/userControllers');

router.post('/register', userConrtollers.register);
router.post('/login', userConrtollers.login);

// router.get('/', verifyTokenAndAdmin, getAllUsers);
router.use(protect);
router.post('/logout', userConrtollers.logout);

module.exports = router;
