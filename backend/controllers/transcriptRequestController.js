const TranscriptRequest = require('../models/TranscriptRequest');

exports.createTranscriptRequest = async (req, res) => {
  try {
    const { purpose, numCopies, destination } = req.body;
    const request = new TranscriptRequest({
      studentId: req.user.userId,
      purpose,
      numCopies,
      destination
    });
    await request.save();
    res.status(201).json({ message: 'Transcript request submitted successfully', data: request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getStudentTranscriptRequests = async (req, res) => {
  try {
    const requests = await TranscriptRequest.find({ studentId: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTranscriptRequestStatus = async (req, res) => {
  try {
    const { action } = req.body;
    const validActions = ['approve', 'reject', 'complete'];
    
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      complete: 'completed'
    };

    const request = await TranscriptRequest.findByIdAndUpdate(
      req.params.id,
      { status: statusMap[action] },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: `Transcript request ${action}ed`, data: request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
