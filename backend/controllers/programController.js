const Program = require('../models/Program');

exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.find().populate('department', 'name code');
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createProgram = async (req, res) => {
  try {
    const { name, department, duration, totalCredits } = req.body;
    const program = await Program.create({ name, department, duration, totalCredits });
    res.status(201).json(program);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return res.status(404).json({ error: 'Program not found' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ error: 'Program not found' });
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
