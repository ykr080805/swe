const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const AttendanceSession = require('../models/AttendanceSession');
const Enrollment = require('../models/Enrollment');
const CourseOffering = require('../models/CourseOffering');

// ─── Assignments ───

exports.createAssignment = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering || offering.faculty.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized for this course' });
    }
    const assignment = await Assignment.create({
      ...req.body,
      courseOffering: courseOfferingId,
      faculty: req.user.userId
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const assignments = await Assignment.find({ courseOffering: courseOfferingId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.assignmentId, faculty: req.user.userId },
      { $set: req.body },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

exports.publishAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.assignmentId, faculty: req.user.userId },
      { isPublished: true },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish assignment' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.assignmentId,
      faculty: req.user.userId
    });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found or not authorized' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// ─── Submission Review ───

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name userId email');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { score, feedback, gradedBy: req.user.userId, gradedAt: new Date() },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to grade submission' });
  }
};

// ─── Attendance ───

exports.markAttendance = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const { date, records } = req.body; // records: [{ student, status }]
    const session = await AttendanceSession.findOneAndUpdate(
      { courseOffering: courseOfferingId, date: new Date(date) },
      { faculty: req.user.userId, records },
      { new: true, upsert: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

exports.getAttendanceSessions = async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ courseOffering: req.params.courseOfferingId })
      .populate('records.student', 'name userId')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// ─── Roster & Grades ───

exports.getRoster = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      courseOffering: req.params.courseOfferingId,
      status: 'enrolled'
    }).populate('student', 'name userId email');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
};

exports.submitGrades = async (req, res) => {
  try {
    const { grades } = req.body; // [{ enrollmentId, grade, gradePoints }]
    const results = [];
    for (const g of grades) {
      const enrollment = await Enrollment.findByIdAndUpdate(
        g.enrollmentId,
        { grade: g.grade, gradePoints: g.gradePoints, isLocked: true },
        { new: true }
      );
      results.push(enrollment);
    }
    res.json({ message: 'Grades submitted', results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit grades' });
  }
};
