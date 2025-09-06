const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'gif'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ match: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });

// Static method to get messages for a match
messageSchema.statics.getMatchMessages = function(matchId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ match: matchId })
    .populate('sender', 'profile.name profile.photos')
    .populate('receiver', 'profile.name profile.photos')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(matchId, userId) {
  return this.updateMany(
    { 
      match: matchId, 
      receiver: userId, 
      isRead: false 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    receiver: userId, 
    isRead: false 
  });
};

module.exports = mongoose.model('Message', messageSchema);
