const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const {
  googleAuth,
  verifyGoogleToken
} = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth routes
router.post('/google', googleAuth);
router.post('/google/verify', verifyGoogleToken);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

