const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate required fields
    if (!email || !password || !profile.name || !profile.age || !profile.gender || !profile.interestedIn) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      profile: {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        interestedIn: profile.interestedIn,
        bio: profile.bio || '',
        location: {
          coordinates: profile.location?.coordinates || [0, 0],
          city: profile.location?.city || ''
        },
        interests: profile.interests || [],
        education: profile.education || '',
        occupation: profile.occupation || ''
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update user's online status and last active
    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        isOnline: user.isOnline,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // Update user's online status
    const user = await User.findById(req.user.id);
    user.isOnline = false;
    user.lastActive = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        isOnline: user.isOnline,
        lastActive: user.lastActive,
        matches: user.matches,
        likes: user.likes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

module.exports = router;
