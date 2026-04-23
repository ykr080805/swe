const mongoose = require('mongoose');

const noDuesItemSchema = new mongoose.Schema({
  department: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Cleared'], default: 'Pending' },
  clearedAt: { type: Date },
  amount: { type: String },
  remark: { type: String }
});

const noDuesSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [noDuesItemSchema],
  isFullyCleared: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NoDues', noDuesSchema);
