const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope: { type: String, enum: ['system', 'course'], default: 'system' },
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering' },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
