const FeedbackWindow = require('../models/FeedbackWindow');
const FeedbackResponse = require('../models/FeedbackResponse');
const Enrollment = require('../models/Enrollment');

// ─── Faculty: Open/Close Feedback Window ───

exports.openWindow = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const { startDate, endDate, questions } = req.body;
    const window = await FeedbackWindow.create({
      courseOffering: courseOfferingId,
      openedBy: req.user.userId,
      startDate,
      endDate,
      questions: questions || [
        { text: 'How would you rate the overall course quality?', type: 'rating' },
        { text: 'How effective was the teaching methodology?', type: 'rating' },
        { text: 'How well-organized was the course material?', type: 'rating' },
        { text: 'Any additional comments or suggestions?', type: 'text' }
      ]
    });
    res.status(201).json(window);
  } catch (err) {
    res.status(500).json({ error: 'Failed to open feedback window' });
  }
};

exports.closeWindow = async (req, res) => {
  try {
    const window = await FeedbackWindow.findByIdAndUpdate(
      req.params.windowId,
      { isActive: false },
      { new: true }
    );
    if (!window) return res.status(404).json({ error: 'Feedback window not found' });
    res.json(window);
  } catch (err) {
    res.status(500).json({ error: 'Failed to close feedback window' });
  }
};

// ─── Student: Submit Feedback ───

exports.getActiveWindow = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const now = new Date();
    const window = await FeedbackWindow.findOne({
      courseOffering: courseOfferingId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    if (!window) return res.status(404).json({ error: 'No active feedback window' });
    res.json(window);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback window' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const now = new Date();
    const window = await FeedbackWindow.findOne({
      courseOffering: courseOfferingId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    if (!window) return res.status(400).json({ error: 'Feedback window is not open' });

    // Anonymous — no student reference stored
    const response = await FeedbackResponse.create({
      feedbackWindow: window._id,
      courseOffering: courseOfferingId,
      answers: req.body.answers,
      overallRating: req.body.overallRating,
      comments: req.body.comments
    });
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// ─── Faculty: View Aggregate Results ───

exports.getResults = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const responses = await FeedbackResponse.find({ courseOffering: courseOfferingId });
    if (responses.length === 0) return res.json({ totalResponses: 0, averageRating: null, results: [] });

    const avgRating = responses.reduce((s, r) => s + (r.overallRating || 0), 0) / responses.length;

    // Aggregate per-question ratings
    const questionMap = {};
    for (const resp of responses) {
      for (const ans of resp.answers) {
        if (!questionMap[ans.questionIndex]) questionMap[ans.questionIndex] = { ratings: [], texts: [] };
        if (ans.rating) questionMap[ans.questionIndex].ratings.push(ans.rating);
        if (ans.text) questionMap[ans.questionIndex].texts.push(ans.text);
      }
    }

    const questionResults = Object.entries(questionMap).map(([idx, data]) => ({
      questionIndex: parseInt(idx),
      averageRating: data.ratings.length > 0 ? (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length).toFixed(2) : null,
      responseCount: data.ratings.length + data.texts.length,
      textResponses: data.texts
    }));

    res.json({
      totalResponses: responses.length,
      averageRating: avgRating.toFixed(2),
      comments: responses.filter(r => r.comments).map(r => r.comments),
      questionResults
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback results' });
  }
};

// ─── Admin: System-wide Feedback Evaluation ───

exports.getAllFeedback = async (req, res) => {
  try {
    const windows = await FeedbackWindow.find()
      .populate('courseOffering')
      .populate('openedBy', 'name')
      .sort({ createdAt: -1 });
    
    const result = [];
    for (const w of windows) {
      const count = await FeedbackResponse.countDocuments({ feedbackWindow: w._id });
      const responses = await FeedbackResponse.find({ feedbackWindow: w._id });
      const avgRating = count > 0 ? (responses.reduce((s, r) => s + (r.overallRating || 0), 0) / count).toFixed(2) : null;
      result.push({
        _id: w._id,
        courseOffering: w.courseOffering,
        openedBy: w.openedBy,
        startDate: w.startDate,
        endDate: w.endDate,
        isActive: w.isActive,
        totalResponses: count,
        averageRating: avgRating
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback data' });
  }
};
