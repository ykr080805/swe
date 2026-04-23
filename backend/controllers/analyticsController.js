const Enrollment = require('../models/Enrollment');
const AttendanceSession = require('../models/AttendanceSession');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');

exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollments = await Enrollment.find({ courseOffering: courseId });

    // Grade distribution
    const gradeDistribution = {};
    let gradedCount = 0;
    for (const e of enrollments) {
      if (e.grade) {
        gradeDistribution[e.grade] = (gradeDistribution[e.grade] || 0) + 1;
        gradedCount++;
      }
    }

    // Average GPA
    const avgGPA = gradedCount > 0
      ? (enrollments.filter(e => e.gradePoints != null).reduce((s, e) => s + e.gradePoints, 0) / gradedCount).toFixed(2)
      : null;

    // Attendance
    const sessions = await AttendanceSession.find({ courseOffering: courseId });
    let totalPresent = 0, totalRecords = 0;
    for (const s of sessions) {
      for (const r of s.records) {
        totalRecords++;
        if (r.status === 'present') totalPresent++;
      }
    }
    const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : null;

    // Assignment completion
    const assignments = await Assignment.find({ courseOffering: courseId });
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } });
    const avgScore = submissions.length > 0
      ? (submissions.filter(s => s.score != null).reduce((sum, s) => sum + s.score, 0) / submissions.filter(s => s.score != null).length).toFixed(1)
      : null;

    res.json({
      totalEnrolled: enrollments.length,
      gradedCount,
      gradeDistribution,
      avgGPA,
      attendanceRate,
      totalSessions: sessions.length,
      totalAssignments: assignments.length,
      totalSubmissions: submissions.length,
      avgAssignmentScore: avgScore
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
};

exports.getProgramAnalytics = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ gradePoints: { $ne: null } })
      .populate('student', '_id')
      .populate({ path: 'courseOffering', populate: { path: 'course', select: 'credits' } });

    const studentMap = {};
    for (const e of enrollments) {
      if (!e.student) continue;
      const sid = e.student._id.toString();
      const credits = e.courseOffering?.course?.credits || 3;
      if (!studentMap[sid]) studentMap[sid] = { total: 0, credits: 0 };
      studentMap[sid].total += e.gradePoints * credits;
      studentMap[sid].credits += credits;
    }
    const cgpas = Object.values(studentMap).map(s => s.credits > 0 ? s.total / s.credits : 0);
    const avgCGPA = cgpas.length > 0 ? (cgpas.reduce((a, b) => a + b, 0) / cgpas.length).toFixed(2) : null;

    const droppedCount = await Enrollment.countDocuments({ status: 'dropped' });
    const totalCount = await Enrollment.countDocuments();

    res.json({
      totalStudents: Object.keys(studentMap).length,
      avgCGPA,
      dropoutRate: totalCount > 0 ? parseFloat(((droppedCount / totalCount) * 100).toFixed(1)) : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch program analytics' });
  }
};

exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const { deptId } = req.params;
    const students = await User.countDocuments({ department: deptId, role: 'student' });
    const faculty = await User.countDocuments({ department: deptId, role: 'faculty' });

    res.json({
      totalStudents: students,
      totalFaculty: faculty,
      department: deptId
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch department analytics' });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const enrollments = await Enrollment.find({ student: studentId })
      .populate({ path: 'courseOffering', populate: { path: 'course', select: 'credits' } });

    let totalCredits = 0, weightedSum = 0;
    for (const e of enrollments) {
      if (e.gradePoints != null) {
        const credits = e.courseOffering?.course?.credits || 3;
        totalCredits += credits;
        weightedSum += e.gradePoints * credits;
      }
    }
    const cgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : null;

    // Attendance
    const coIds = enrollments.map(e => e.courseOffering?._id).filter(Boolean);
    const sessions = await AttendanceSession.find({ courseOffering: { $in: coIds } });
    let attended = 0, total = 0;
    for (const s of sessions) {
      const record = s.records.find(r => r.student.toString() === studentId.toString());
      if (record) {
        total++;
        if (record.status === 'present') attended++;
      }
    }

    res.json({
      totalCourses: enrollments.length,
      cgpa,
      attendanceRate: total > 0 ? Math.round((attended / total) * 100) : null,
      totalCreditsEarned: totalCredits
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
};
