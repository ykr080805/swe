const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { validatePassword } = require('../utils/passwordPolicy');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('user', 'name email userId department')
      .populate('program', 'name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createStudent = async (req, res) => {
  let user = null;
  try {
    const { userId, name, email, department, password, rollNumber, program, batch, currentSemester } = req.body;
    const check = validatePassword(password, userId);
    if (!check.ok) return res.status(400).json({ error: check.error });
    user = await User.create({ userId, name, email, department, password, role: 'student' });
    const profile = await StudentProfile.create({
      user: user._id,
      rollNumber: rollNumber || userId,
      program: program || undefined,
      batch,
      currentSemester: currentSemester || 1
    });
    res.status(201).json({ user: { _id: user._id, userId, name, email }, profile });
  } catch (err) {
    if (user) await User.findByIdAndDelete(user._id).catch(() => {});
    if (err.code === 11000) return res.status(409).json({ error: 'User ID, email, or roll number already exists' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('user');
    if (!profile) return res.status(404).json({ error: 'Student not found' });

    const { name, email, department, rollNumber, program, batch, currentSemester } = req.body;
    await User.findByIdAndUpdate(profile.user._id, { name, email, department }, { runValidators: true });
    await StudentProfile.findByIdAndUpdate(req.params.id, { rollNumber, program, batch, currentSemester }, { new: true, runValidators: true });

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const profile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      { academicStatus: status },
      { new: true, runValidators: true }
    );
    if (!profile) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: `Student status updated to ${status}`, profile });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    const { parse } = require('csv-parse/sync');
    const Program = require('../models/Program');

    // Read from multer memory buffer instead of file path
    const csvContent = req.file.buffer.toString('utf8');
    const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

    const programs = await Program.find({});
    const programMap = {};
    programs.forEach(p => {
      programMap[p.name.toLowerCase()] = p._id;
    });

    const results = { success: 0, failed: 0, errors: [] };

    for (const row of records) {
      let user = null;
      try {
        const password = row.password || 'changeme123';
        const userId = row.userId || row['Roll Number'];
        const name = row.name || row['Student Name'];
        const email = row.email || row['Student Email'];
        const department = row.department || row['Department'];
        const batch = row.batch || row['Batch'];
        const currentSemester = row.currentSemester || row['Current Semester'];

        let programId = undefined;
        const progStr = row.program || row['Program'];
        if (progStr) {
           if (progStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(progStr)) {
               programId = progStr;
           } else {
               programId = programMap[progStr.toLowerCase()];
           }
        }

        // Note: bulk-import passwords are intentionally permissive — the user
        // will be required to change on first login (handled at auth time).
        user = await User.create({
          userId: userId,
          name: name,
          email: email,
          department: department,
          password,
          role: 'student'
        });
        await StudentProfile.create({
          user: user._id,
          rollNumber: row.rollNumber || userId,
          program: programId,
          batch: batch,
          currentSemester: parseInt(currentSemester) || 1
        });
        results.success++;
      } catch (err) {
        // Roll back the User if profile creation failed, so we don't leave orphans.
        if (user) await User.findByIdAndDelete(user._id).catch(() => {});
        results.failed++;
        results.errors.push({ row: row.userId || row['Roll Number'] || row.email || row['Student Email'], error: err.message });
      }
    }

    res.json({ message: `Import complete: ${results.success} succeeded, ${results.failed} failed`, ...results });
  } catch (err) {
    res.status(500).json({ error: 'Bulk import failed: ' + err.message });
  }
};
