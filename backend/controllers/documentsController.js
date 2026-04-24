const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const GRADE_POINTS = { 'AA': 10, 'AB': 9, 'BB': 8, 'BC': 7, 'CC': 6, 'CD': 5, 'DD': 4, 'fail': 0 };

const buildTranscriptPDF = async (studentId) => {
  const student = await User.findById(studentId).select('-password');
  if (!student) throw new Error('Student not found');

  const enrollments = await Enrollment.find({ student: studentId, status: 'completed' })
    .populate({ path: 'courseOffering', populate: { path: 'course', select: 'name code credits' } })
    .sort({ year: 1, semester: 1 });

  const documentId = crypto.randomUUID();
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `transcript_${documentId}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('ACADEMIC TRANSCRIPT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').text('Indian Institute of Technology Guwahati', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#666').text(`Document ID: ${documentId}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Student info
    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Student Information');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${student.name}`);
    doc.text(`ID: ${student.userId}`);
    doc.text(`Department: ${student.department || 'N/A'}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown(1);

    // Group by semester
    const semMap = {};
    for (const e of enrollments) {
      const key = `${e.year}-${e.semester}`;
      if (!semMap[key]) semMap[key] = { label: `${e.semester} ${e.year}`, courses: [] };
      semMap[key].courses.push(e);
    }

    let totalWeighted = 0, totalCredits = 0;

    for (const { label, courses } of Object.values(semMap)) {
      doc.font('Helvetica-Bold').fontSize(10).text(label);
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Code', 50, doc.y, { width: 80 });
      doc.text('Course Name', 130, doc.y - 10, { width: 220 });
      doc.text('Cr', 350, doc.y - 10, { width: 30 });
      doc.text('Grade', 385, doc.y - 10, { width: 50 });
      doc.text('Pts', 440, doc.y - 10, { width: 40 });
      doc.moveDown(0.2);
      doc.moveTo(50, doc.y).lineTo(490, doc.y).stroke();
      doc.moveDown(0.2);

      let semWeighted = 0, semCredits = 0;
      doc.font('Helvetica').fontSize(9);
      for (const e of courses) {
        const course = e.courseOffering?.course;
        const credits = course?.credits || 3;
        const grade = e.grade || '-';
        const pts = GRADE_POINTS[grade] ?? e.gradePoints ?? null;

        doc.text(course?.code || '-', 50, doc.y, { width: 80 });
        doc.text(course?.name || 'Unknown', 130, doc.y - 10, { width: 220 });
        doc.text(String(credits), 350, doc.y - 10, { width: 30 });
        doc.text(grade, 385, doc.y - 10, { width: 50 });
        doc.text(pts != null ? pts.toFixed(1) : '-', 440, doc.y - 10, { width: 40 });
        doc.moveDown(0.3);

        if (pts != null) { semWeighted += pts * credits; semCredits += credits; }
      }
      const sgpa = semCredits > 0 ? (semWeighted / semCredits).toFixed(2) : 'N/A';
      doc.font('Helvetica-Bold').fontSize(9).text(`SGPA: ${sgpa}`, { align: 'right' });
      doc.moveDown(0.8);

      totalWeighted += semWeighted;
      totalCredits += semCredits;
    }

    doc.moveTo(50, doc.y).lineTo(490, doc.y).stroke();
    doc.moveDown(0.5);
    const cgpa = totalCredits > 0 ? (totalWeighted / totalCredits).toFixed(2) : 'N/A';
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000');
    doc.text(`Total Credits: ${totalCredits}     CGPA: ${cgpa}`);

    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#999');
    doc.text('This is a system-generated document. Verify authenticity using the Document ID.', { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { documentId, student };
};

exports.generateTranscript = async (req, res) => {
  try {
    const { documentId } = await buildTranscriptPDF(req.params.studentId);
    res.status(201).json({
      message: 'Transcript generated successfully',
      documentId,
      downloadUrl: `/api/documents/transcript/${documentId}`
    });
  } catch (err) {
    res.status(err.message === 'Student not found' ? 404 : 500)
      .json({ error: err.message || 'Failed to generate transcript' });
  }
};

exports.generateMyTranscript = async (req, res) => {
  try {
    const { documentId } = await buildTranscriptPDF(req.user.userId);
    res.status(201).json({
      message: 'Transcript generated successfully',
      documentId,
      downloadUrl: `/api/documents/transcript/${documentId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to generate transcript' });
  }
};

exports.downloadTranscript = async (req, res) => {
  try {
    const { documentId } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', `transcript_${documentId}.pdf`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Transcript not found' });
    res.download(filePath, `transcript_${documentId}.pdf`);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download transcript' });
  }
};

exports.verifyTranscript = async (req, res) => {
  try {
    const { documentId } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', `transcript_${documentId}.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.json({ valid: false, message: 'Document not found' });
    }
    res.json({ valid: true, documentId, generatedAt: fs.statSync(filePath).mtime });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify transcript' });
  }
};
