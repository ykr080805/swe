const mongoose = require('mongoose');

const hostelTransferSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentHostel: { type: String, required: true },
  currentRoom: { type: String, required: true },
  preferredHostel: { type: String, required: true },
  preferredRoom: { type: String },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewRemarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('HostelTransfer', hostelTransferSchema);
