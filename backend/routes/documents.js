const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

const documentsController = require('../controllers/documentsController');

router.post('/transcript/:studentId', authenticate, authorizeRoles('admin'), auditLogger('GENERATE_TRANSCRIPT'), documentsController.generateTranscript);

router.get('/transcript/verify/:documentId', documentsController.verifyTranscript);

router.get('/transcript/:documentId', authenticate, documentsController.downloadTranscript);

module.exports = router;
