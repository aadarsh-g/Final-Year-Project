const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationOTP, sendWelcomeEmail } = require('../services/emailService');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, agreedToTerms } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user agreed to terms
    if (!agreedToTerms) {
      return res.status(400).json({
        success: false,
        message: 'You must agree to the terms and conditions'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      agreedToTerms,
      role: 'user', // Default role
      isVerified: false // User must verify email
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing (security best practice)
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Set OTP and expiration (10 minutes from now)
    user.verificationOTP = hashedOTP;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // ✅ DEV: Print OTP to console so you can always see it
    console.log('\n🔐 ============ OTP VERIFICATION CODE ============');
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Expires in: 10 minutes`);
    console.log('=================================================\n');

    // Send OTP email
    try {
      await sendVerificationOTP(email, fullName, otp);
      console.log(`✅ OTP email sent to: ${email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      console.log('💡 Use the OTP above from the console instead.');
      // Don't fail signup if email fails - user can see OTP in console
    }

    // Don't generate token yet - user must verify first
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email for verification code.',
      userId: user._id,
      email: user.email,
      requiresVerification: true,
      // DEV MODE: Return OTP directly so it shows on screen (remove in production)
      devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if email is verified (only for local auth, not Google)
    if (user.authProvider === 'local' && !user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token (longer expiry if rememberMe is checked)
    const tokenExpiry = rememberMe ? '30d' : process.env.JWT_EXPIRE;
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const user = await User.findById(req.user.id);

    if (fullName) user.fullName = fullName;
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      user.email = email;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google sign-in. Change your password in your Google account settings.',
      });
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Validation
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and OTP'
      });
    }

    // Find user with OTP fields
    const user = await User.findById(userId).select('+verificationOTP +otpExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Check if OTP exists
    if (!user.verificationOTP || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.'
      });
    }

    // Check if OTP expired
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
        expired: true
      });
    }

    // Hash the provided OTP and compare with stored hash
    const hashedInputOTP = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    
    if (hashedInputOTP !== user.verificationOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
    }

    // OTP is valid - verify the user
    user.isVerified = true;
    user.verificationOTP = undefined; // Clear OTP
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Generate JWT token for auto-login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Find user by ID or email
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID or email'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Update OTP and expiration
    user.verificationOTP = hashedOTP;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // ✅ DEV: Print OTP to console
    console.log('\n🔐 ============ RESEND OTP CODE ============');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Expires in: 10 minutes`);
    console.log('==========================================\n');

    // Send OTP email
    try {
      await sendVerificationOTP(user.email, user.fullName, otp);
      console.log(`✅ OTP email resent to: ${user.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
      userId: user._id,
      // DEV MODE: Return OTP directly so it shows on screen (remove in production)
      devOTP: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
};
