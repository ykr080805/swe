const Course = require('../models/Course');
const CourseOffering = require('../models/CourseOffering');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isRetired: false })
      .populate('prerequisites', 'code name')
      .populate('department', 'name code');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { code, name, credits, description, prerequisites, department } = req.body;
    const course = await Course.create({ code, name, credits, description, prerequisites, department });
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Course code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createOffering = async (req, res) => {
  try {
    const { faculty, semester, year, capacity } = req.body;
    const offering = await CourseOffering.create({ course: req.params.id, faculty, semester, year, capacity });
    res.status(201).json(offering);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.retireCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isRetired: true }, { new: true });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course retired', course });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAvailableCourses = async (req, res) => {
  try {
    const offerings = await CourseOffering.find({ isOpen: true })
      .populate({
        path: 'course',
        match: { isRetired: false },
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'prerequisites', select: 'code name' }
        ]
      })
      .populate('faculty', 'name');
    res.json(offerings.filter(o => o.course));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
