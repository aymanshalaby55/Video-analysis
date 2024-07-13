const express = require('express');

const router = express.Router();
const { verifyTokenAndAdmin, protect } = require('../middleware/verifyToken');

const userConrtollers = require('../controllers/userControllers');

router.post('/register', userConrtollers.register);
router.post('/login', userConrtollers.login);

router.use(protect);
router.get('/', verifyTokenAndAdmin, userConrtollers.getAllUsers);
router.post('/logout', userConrtollers.logout);
router.patch('/edit/:userId', userConrtollers.updateStudent);
router.get('/:id', userConrtollers.getUser);

module.exports = router;
