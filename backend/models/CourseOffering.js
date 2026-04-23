const mongoose = require('mongoose');

const courseOfferingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 60 },
  enrolled: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CourseOffering', courseOfferingSchema);
