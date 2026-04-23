const NoDues = require('../models/NoDues');

const DEFAULT_DEPARTMENTS = [
  'Central Library', 'Hostel Office', 'Sports Complex',
  'Department Lab', 'Finance Section'
];

exports.getMyNoDues = async (req, res) => {
  try {
    let noDues = await NoDues.findOne({ student: req.user.userId });
    if (!noDues) {
      noDues = await NoDues.create({
        student: req.user.userId,
        items: DEFAULT_DEPARTMENTS.map(dept => ({ department: dept, status: 'Pending' }))
      });
    }
    res.json(noDues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch no-dues status' });
  }
};

exports.clearItem = async (req, res) => {
  try {
    const noDues = await NoDues.findOne({ student: req.params.studentId });
    if (!noDues) return res.status(404).json({ error: 'No dues record not found' });

    const item = noDues.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Department item not found' });

    item.status = 'Cleared';
    item.clearedAt = new Date();
    noDues.isFullyCleared = noDues.items.every(i => i.status === 'Cleared');
    await noDues.save();
    res.json(noDues);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear item' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const records = await NoDues.find().populate('student', 'name userId email');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch no-dues records' });
  }
};
