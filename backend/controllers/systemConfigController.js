const SystemConfig = require('../models/SystemConfig');

exports.getConfig = async (req, res) => {
  try {
    const config = await SystemConfig.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system config' });
  }
};
