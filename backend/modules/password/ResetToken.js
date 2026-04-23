// Day 3: Reset Token Database Schema
const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tokenHash: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 3600 // Token automatically deletes from DB after 1 hour (3600 seconds)
  }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
