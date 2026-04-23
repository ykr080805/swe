const mongoose = require('mongoose');

const hmcMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  role: { type: String, enum: ['Warden', 'Assistant Warden', 'HMC Secretary', 'HMC Member'], default: 'HMC Member' },
  hostel: { type: String },
  appointedAt: { type: Date, default: Date.now },
  termEnd: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HMCMember', hmcMemberSchema);
