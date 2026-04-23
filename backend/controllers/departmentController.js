const Department = require('../models/Department');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('headOfDepartment', 'name email');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, headOfDepartment } = req.body;
    const dept = await Department.create({ name, code, headOfDepartment });
    res.status(201).json(dept);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Department name or code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
