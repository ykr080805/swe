const Asset = require('../models/Asset');

exports.create = async (req, res) => {
  try {
    const asset = await Asset.create({ ...req.body, addedBy: req.user.userId });
    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create asset' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hostel) filter['location.hostel'] = req.query.hostel;
    if (req.query.condition) filter.condition = req.query.condition;
    const assets = await Asset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

exports.update = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

exports.logMaintenance = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    asset.maintenanceLog.push(req.body);
    asset.lastMaintenanceDate = new Date();
    if (req.body.newCondition) asset.condition = req.body.newCondition;
    await asset.save();
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log maintenance' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove asset' });
  }
};
