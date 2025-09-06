const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: user.publicProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      age,
      bio,
      interests,
      education,
      occupation,
      location
    } = req.body;

    const user = await User.findById(req.user.id);

    // Update fields if provided
    if (name) user.profile.name = name;
    if (age) user.profile.age = age;
    if (bio !== undefined) user.profile.bio = bio;
    if (interests) user.profile.interests = interests;
    if (education !== undefined) user.profile.education = education;
    if (occupation !== undefined) user.profile.occupation = occupation;
    if (location) {
      if (location.coordinates) user.profile.location.coordinates = location.coordinates;
      if (location.city) user.profile.location.city = location.city;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: user.publicProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { ageRange, maxDistance, interestedIn } = req.body;

    const user = await User.findById(req.user.id);

    if (ageRange) {
      user.preferences.ageRange = ageRange;
    }
    if (maxDistance) {
      user.preferences.maxDistance = maxDistance;
    }
    if (interestedIn) {
      user.profile.interestedIn = interestedIn;
    }

    await user.save();

    res.status(200).json({
      success: true,
      preferences: user.preferences,
      interestedIn: user.profile.interestedIn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences',
      error: error.message
    });
  }
});

// @desc    Upload profile photo
// @route   POST /api/users/photos
// @access  Private
router.post('/photos', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a photo file'
      });
    }

    const user = await User.findById(req.user.id);
    const photoUrl = `/uploads/${req.file.filename}`;

    // If this is the first photo, make it the main photo
    const isMain = user.profile.photos.length === 0;

    user.profile.photos.push({
      url: photoUrl,
      isMain: isMain
    });

    await user.save();

    res.status(200).json({
      success: true,
      photo: {
        url: photoUrl,
        isMain: isMain
      },
      photos: user.profile.photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error uploading photo',
      error: error.message
    });
  }
});

// @desc    Set main profile photo
// @route   PUT /api/users/photos/main
// @access  Private
router.put('/photos/main', protect, async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    const user = await User.findById(req.user.id);

    // Reset all photos to not be main
    user.profile.photos.forEach(photo => {
      photo.isMain = false;
    });

    // Set the specified photo as main
    const targetPhoto = user.profile.photos.find(photo => photo.url === photoUrl);
    if (!targetPhoto) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    targetPhoto.isMain = true;
    await user.save();

    res.status(200).json({
      success: true,
      photos: user.profile.photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error setting main photo',
      error: error.message
    });
  }
});

// @desc    Delete profile photo
// @route   DELETE /api/users/photos
// @access  Private
router.delete('/photos', protect, async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }

    const user = await User.findById(req.user.id);

    // Remove the photo from array
    user.profile.photos = user.profile.photos.filter(photo => photo.url !== photoUrl);

    // If the deleted photo was main and there are other photos, make the first one main
    if (user.profile.photos.length > 0 && !user.profile.photos.some(photo => photo.isMain)) {
      user.profile.photos[0].isMain = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      photos: user.profile.photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting photo',
      error: error.message
    });
  }
});

// @desc    Get potential matches
// @route   GET /api/users/discover
// @access  Private
router.get('/discover', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { page = 1, limit = 10 } = req.query;

    // Build match criteria
    const matchCriteria = {
      _id: { $ne: currentUser._id }, // Not current user
      isActive: true,
      'profile.age': {
        $gte: currentUser.preferences.ageRange.min,
        $lte: currentUser.preferences.ageRange.max
      }
    };

    // Filter by gender preference
    if (currentUser.profile.interestedIn !== 'both') {
      matchCriteria['profile.gender'] = currentUser.profile.interestedIn;
    }

    // Exclude users already liked or disliked
    const likedUserIds = currentUser.likes.map(like => like.user);
    const dislikedUserIds = currentUser.dislikes.map(dislike => dislike.user);
    const excludeUserIds = [...likedUserIds, ...dislikedUserIds];

    if (excludeUserIds.length > 0) {
      matchCriteria._id.$nin = excludeUserIds;
    }

    // Get potential matches
    let potentialMatches = await User.find(matchCriteria)
      .select('profile isOnline lastActive')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by distance if location is set
    if (currentUser.profile.location.coordinates[0] !== 0 || currentUser.profile.location.coordinates[1] !== 0) {
      potentialMatches = potentialMatches.filter(match => {
        if (match.profile.location.coordinates[0] === 0 && match.profile.location.coordinates[1] === 0) {
          return true; // Include users without location set
        }
        
        const distance = currentUser.calculateDistance(match);
        return distance <= currentUser.preferences.maxDistance;
      });
    }

    res.status(200).json({
      success: true,
      matches: potentialMatches,
      count: potentialMatches.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching potential matches',
      error: error.message
    });
  }
});

module.exports = router;
