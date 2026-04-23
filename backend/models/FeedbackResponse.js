const mongoose = require('mongoose');

const feedbackResponseSchema = new mongoose.Schema({
  feedbackWindow: { type: mongoose.Schema.Types.ObjectId, ref: 'FeedbackWindow', required: true },
  courseOffering: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
  // No student reference — anonymous by design
  answers: [{
    questionIndex: { type: Number, required: true },
    rating: { type: Number, min: 1, max: 5 },
    text: { type: String }
  }],
  overallRating: { type: Number, min: 1, max: 5 },
  comments: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FeedbackResponse', feedbackResponseSchema);
