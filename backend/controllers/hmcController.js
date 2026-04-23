const HMCMember = require('../models/HMCMember');

exports.getAll = async (req, res) => {
  try {
    const members = await HMCMember.find({ isActive: true })
      .populate('user', 'name userId email department');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch HMC members' });
  }
};

exports.add = async (req, res) => {
  try {
    const member = await HMCMember.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'User is already an HMC member' });
    res.status(500).json({ error: 'Failed to add HMC member' });
  }
};

exports.update = async (req, res) => {
  try {
    const member = await HMCMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'HMC member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update HMC member' });
  }
};

exports.remove = async (req, res) => {
  try {
    await HMCMember.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'HMC member removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove HMC member' });
  }
};
