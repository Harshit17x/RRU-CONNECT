const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Must be at least 18 years old'],
      max: [100, 'Age cannot exceed 100']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other']
    },
    interestedIn: {
      type: String,
      required: [true, 'Interest preference is required'],
      enum: ['male', 'female', 'both']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      city: {
        type: String,
        default: ''
      }
    },
    photos: [{
      url: {
        type: String,
        required: true
      },
      isMain: {
        type: Boolean,
        default: false
      }
    }],
    interests: [{
      type: String,
      trim: true
    }],
    education: {
      type: String,
      default: ''
    },
    occupation: {
      type: String,
      default: ''
    }
  },
  preferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
        min: 18
      },
      max: {
        type: Number,
        default: 50,
        max: 100
      }
    },
    maxDistance: {
      type: Number,
      default: 50, // km
      min: 1,
      max: 500
    }
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'profile.location': '2dsphere' });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get main photo
userSchema.methods.getMainPhoto = function() {
  const mainPhoto = this.profile.photos.find(photo => photo.isMain);
  return mainPhoto ? mainPhoto.url : (this.profile.photos.length > 0 ? this.profile.photos[0].url : null);
};

// Method to calculate age from birthdate (if you want to store birthdate instead of age)
userSchema.methods.calculateDistance = function(otherUser) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = this.toRad(otherUser.profile.location.coordinates[1] - this.profile.location.coordinates[1]);
  const dLon = this.toRad(otherUser.profile.location.coordinates[0] - this.profile.location.coordinates[0]);
  
  const lat1 = this.toRad(this.profile.location.coordinates[1]);
  const lat2 = this.toRad(otherUser.profile.location.coordinates[1]);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

userSchema.methods.toRad = function(value) {
  return value * Math.PI / 180;
};

// Virtual for public profile (removes sensitive data)
userSchema.virtual('publicProfile').get(function() {
  return {
    _id: this._id,
    profile: this.profile,
    preferences: this.preferences,
    isOnline: this.isOnline,
    lastActive: this.lastActive
  };
});

module.exports = mongoose.model('User', userSchema);
