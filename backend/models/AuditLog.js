const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: String },
  action: { type: String, required: true },
  targetResource: { type: String },
  ipAddress: { type: String },
  outcome: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
