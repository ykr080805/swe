const mongoose = require('mongoose');

const courseOfferingSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // Primary instructor (kept for backward compatibility with all existing queries)
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // All instructors: includes the primary faculty + any co-instructors.
  // Populated on creation. Co-instructors can mark attendance, manage assignments,
  // grade submissions — but only the primary faculty can submit final grades.
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  semester: { type: String, required: true },
  year: { type: Number, required: true },
  capacity: { type: Number, required: true, default: 60 },
  enrolled: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('CourseOffering', courseOfferingSchema);
