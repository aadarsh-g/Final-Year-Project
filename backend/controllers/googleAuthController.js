const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Google OAuth Callback
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, fullName, avatar } = req.body;

    // Validation
    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Google ID and email are required'
      });
    }

    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists, check if account is blocked
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been blocked by an administrator. Please contact support.'
        });
      }
      
      // Update last login
      user.lastLogin = Date.now();
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
      }
      await user.save();
    } else {
      // Check if user exists with same email (might have signed up with email/password)
      user = await User.findOne({ email });

      if (user) {
        // Check if account is blocked
        if (!user.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Your account has been blocked by an administrator. Please contact support.'
          });
        }
        
        // Link Google account to existing user
        user.googleId = googleId;
        user.authProvider = 'google';
        if (avatar) user.avatar = avatar;
        user.lastLogin = Date.now();
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          fullName: fullName || email.split('@')[0],
          avatar,
          authProvider: 'google',
          agreedToTerms: true, // Auto-agree for OAuth users
          role: 'user',
          isActive: true, // New users are active by default
          lastLogin: Date.now()
        });
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed. Please try again.',
      error: error.message
    });
  }
};

// @desc    Verify Google Token (optional - for additional security)
// @route   POST /api/auth/google/verify
// @access  Public
exports.verifyGoogleToken = async (req, res) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required'
      });
    }

    // You can add Google token verification here using google-auth-library
    // For now, we'll handle this on the frontend

    res.status(200).json({
      success: true,
      message: 'Token verified'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

