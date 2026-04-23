const HostelTransfer = require('../models/HostelTransfer');

exports.create = async (req, res) => {
  try {
    const transfer = await HostelTransfer.create({ ...req.body, student: req.user.userId });
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transfer request' });
  }
};

exports.getMyTransfers = async (req, res) => {
  try {
    const transfers = await HostelTransfer.find({ student: req.user.userId }).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const transfers = await HostelTransfer.find()
      .populate('student', 'name userId email')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
};

exports.review = async (req, res) => {
  try {
    const { status, reviewRemarks } = req.body;
    const transfer = await HostelTransfer.findByIdAndUpdate(
      req.params.id,
      { status, reviewRemarks, reviewedBy: req.user.userId, reviewedAt: new Date() },
      { new: true }
    );
    if (!transfer) return res.status(404).json({ error: 'Transfer request not found' });
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to review transfer request' });
  }
};
