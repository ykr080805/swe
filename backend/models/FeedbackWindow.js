const mongoose = require('mongoose');

const feedbackWindowSchema = new mongoose.Schema({
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  questions: [{
    text: { type: String, required: true },
    type: { type: String, enum: ['rating', 'text'], default: 'rating' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('FeedbackWindow', feedbackWindowSchema);
