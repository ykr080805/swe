const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  description: { type: String },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isRetired: { type: Boolean, default: false },

  // Course type
  // 'core'                 — compulsory for specific departments/programs
  // 'departmental_elective'— elective within a department (only that dept sees it)
  // 'open_elective'        — open to all departments/programs
  type: {
    type: String,
    enum: ['core', 'departmental_elective', 'open_elective'],
    default: 'core'
  },

  // For core / departmental_elective: which departments are eligible.
  // Empty array = no restriction (all departments).
  allowedDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],

  // Which programs are eligible.
  // Empty array = no restriction (all programs).
  allowedPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
