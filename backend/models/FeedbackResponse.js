const mongoose = require('mongoose');

const feedbackResponseSchema = new mongoose.Schema({
  feedbackWindow: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackWindow', required: true },
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
  // No student reference — anonymous by design
  answers: [{
    questionIndex: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    text: { type: String, default: '' }
  }],
  overallRating: { type: Number, min: 1, max: 5 },
  comments: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('FeedbackResponse', feedbackResponseSchema);
