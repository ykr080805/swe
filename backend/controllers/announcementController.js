const Announcement = require('../models/Announcement');
const Enrollment = require('../models/Enrollment');

exports.create = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user.userId
    });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { role, userId } = req.user;
    let filter = {};

    if (role === 'admin') {
      // Admin sees everything
    } else if (role === 'student') {
      const enrollments = await Enrollment.find({ student: userId, status: 'enrolled' });
      const courseOfferingIds = enrollments.map(e => e.courseOffering);
      filter = {
        $or: [
          { scope: 'system' },
          { scope: 'course', courseOffering: { $in: courseOfferingIds } }
        ]
      };
    } else if (role === 'faculty') {
      filter = {
        $or: [
          { scope: 'system' },
          { author: userId }
        ]
      };
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this announcement' });
    }
    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
