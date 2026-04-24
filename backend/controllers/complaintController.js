const Complaint = require('../models/Complaint');

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, student: req.user.userId };
    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      data.attachment = `data:${req.file.mimetype};base64,${base64Data}`;
    }
    const complaint = await Complaint.create(data);
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to file complaint' });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'name userId email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolvedBy: req.user.userId, resolvedAt: status === 'Resolved' ? new Date() : undefined },
      { new: true }
    );
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};
