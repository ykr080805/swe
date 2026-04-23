const LeaveRequest = require('../models/LeaveRequest');

exports.create = async (req, res) => {
  try {
    const leave = await LeaveRequest.create({ ...req.body, student: req.user.userId });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create leave request' });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ student: req.user.userId }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('student', 'name userId email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
};

exports.review = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user.userId, reviewedAt: new Date() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: 'Failed to review leave request' });
  }
};
