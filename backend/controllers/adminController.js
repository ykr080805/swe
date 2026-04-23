const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
