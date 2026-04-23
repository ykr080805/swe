const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Furniture', 'Appliance', 'Infrastructure', 'Electronics', 'Other'], required: true },
  location: {
    hostel: { type: String, required: true },
    block: { type: String },
    room: { type: String }
  },
  condition: { type: String, enum: ['Good', 'Fair', 'Damaged', 'Under Repair', 'Disposed'], default: 'Good' },
  acquisitionDate: { type: Date },
  lastMaintenanceDate: { type: Date },
  maintenanceLog: [{
    date: { type: Date, default: Date.now },
    description: { type: String },
    performedBy: { type: String },
    cost: { type: Number }
  }],
  linkedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
