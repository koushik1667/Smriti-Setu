const express = require('express');
const router = express.Router();
const { register, login, getProfile, googleLogin } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', verifyToken, getProfile);


module.exports = router;
