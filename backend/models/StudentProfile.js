const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String, required: true, unique: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  batch: { type: String },
  currentSemester: { type: Number, default: 1 },
  academicStatus: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
