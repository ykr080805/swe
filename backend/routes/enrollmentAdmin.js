const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const enrollmentAdminController = require('../controllers/enrollmentAdminController');

// /report must come before /:id to avoid being shadowed
router.get('/report', authenticate, authorizeRoles('admin'), enrollmentAdminController.getEnrollmentReport);
router.get('/offerings', authenticate, authorizeRoles('admin'), enrollmentAdminController.getOfferings);

router.get('/', authenticate, authorizeRoles('admin'), enrollmentAdminController.getAllEnrollments);
router.post('/', authenticate, authorizeRoles('admin'), auditLogger('MANUAL_ENROLL'), enrollmentAdminController.manualEnroll);
router.delete('/:id', authenticate, authorizeRoles('admin'), auditLogger('REMOVE_ENROLLMENT'), enrollmentAdminController.removeEnrollment);

module.exports = router;
