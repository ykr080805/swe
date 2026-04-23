const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

exports.generateTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const enrollments = await Enrollment.find({ student: studentId, grade: { $ne: null } })
      .populate({
        path: 'courseOffering',
        populate: { path: 'course', select: 'name code credits' }
      });

    const documentId = crypto.randomUUID();
    const filePath = path.join(__dirname, '..', 'uploads', `transcript_${documentId}.pdf`);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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

    // Student Info
    doc.fillColor('#000').fontSize(11).font('Helvetica-Bold').text('Student Information');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${student.name}`);
    doc.text(`ID: ${student.userId}`);
    doc.text(`Department: ${student.department || 'N/A'}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown(1);

    // Table Header
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Course Code', 50, doc.y, { width: 100 });
    doc.text('Course Name', 150, doc.y - 12, { width: 200 });
    doc.text('Credits', 350, doc.y - 12, { width: 60 });
    doc.text('Grade', 410, doc.y - 12, { width: 60 });
    doc.text('Points', 470, doc.y - 12, { width: 60 });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(530, doc.y).stroke();
    doc.moveDown(0.3);

    // Table Rows
    doc.font('Helvetica').fontSize(9);
    let totalCredits = 0, weightedSum = 0;
    for (const e of enrollments) {
      const course = e.courseOffering?.course;
      const code = course?.code || 'N/A';
      const name = course?.name || 'Unknown Course';
      const credits = course?.credits || 3;
      const grade = e.grade || '-';
      const points = e.gradePoints != null ? e.gradePoints.toFixed(1) : '-';

      doc.text(code, 50, doc.y, { width: 100 });
      doc.text(name, 150, doc.y - 10, { width: 200 });
      doc.text(String(credits), 350, doc.y - 10, { width: 60 });
      doc.text(grade, 410, doc.y - 10, { width: 60 });
      doc.text(points, 470, doc.y - 10, { width: 60 });
      doc.moveDown(0.3);

      if (e.gradePoints != null) {
        totalCredits += credits;
        weightedSum += e.gradePoints * credits;
      }
    }

    // CGPA Summary
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(530, doc.y).stroke();
    doc.moveDown(0.5);
    const cgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 'N/A';
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text(`Total Credits: ${totalCredits}     CGPA: ${cgpa}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#999');
    doc.text('This is a system-generated document. Verify authenticity using the Document ID.', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.status(201).json({
        message: 'Transcript generated successfully',
        documentId,
        downloadUrl: `/api/documents/transcript/${documentId}`
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate transcript: ' + err.message });
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
