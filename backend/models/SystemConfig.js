const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  dropDeadline: { type: Date, default: () => new Date('2026-06-15') },
  minCredits: { type: Number, default: 15 },
  maxCredits: { type: Number, default: 26 },
  currentSemester: { type: String, default: 'Spring' },
  currentYear: { type: Number, default: 2026 },
  registrationOpen: { type: Boolean, default: true }
}, { timestamps: true });

// Singleton pattern — always one document
systemConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
