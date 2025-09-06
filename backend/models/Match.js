const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  matchedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
matchSchema.index({ users: 1 });
matchSchema.index({ matchedAt: -1 });

// Validate that match has exactly 2 users
matchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    next(new Error('A match must have exactly 2 users'));
  }
  
  // Ensure users are not the same
  if (this.users[0].toString() === this.users[1].toString()) {
    next(new Error('A user cannot match with themselves'));
  }
  
  next();
});

// Static method to find matches for a user
matchSchema.statics.findUserMatches = function(userId) {
  return this.find({
    users: userId,
    isActive: true
  })
  .populate('users', 'profile.name profile.photos isOnline lastActive')
  .populate('lastMessage')
  .sort({ lastMessageAt: -1 });
};

// Static method to check if two users are matched
matchSchema.statics.areMatched = function(user1Id, user2Id) {
  return this.findOne({
    users: { $all: [user1Id, user2Id] },
    isActive: true
  });
};

module.exports = mongoose.model('Match', matchSchema);
