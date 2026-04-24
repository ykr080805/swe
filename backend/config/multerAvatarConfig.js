const multer = require('multer');

// Use memory storage — the file buffer is kept in memory (req.file.buffer)
// and converted to a Base64 data URL to store directly in MongoDB.
// No files are written to disk at all.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  }
});
