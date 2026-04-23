const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true, unique: true },
  designation: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedOfferings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);
