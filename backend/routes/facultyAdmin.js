const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const facultyAdminController = require('../controllers/facultyAdminController');

router.get('/', authenticate, authorizeRoles('admin'), facultyAdminController.getAllFaculty);
router.post('/', authenticate, authorizeRoles('admin'), auditLogger('CREATE_FACULTY'), facultyAdminController.createFaculty);
router.put('/:id', authenticate, authorizeRoles('admin'), auditLogger('UPDATE_FACULTY'), facultyAdminController.updateFaculty);
router.post('/:id/courses', authenticate, authorizeRoles('admin'), auditLogger('ASSIGN_COURSE'), facultyAdminController.assignCourse);
router.patch('/:id/status', authenticate, authorizeRoles('admin'), auditLogger('UPDATE_FACULTY_STATUS'), facultyAdminController.updateFacultyStatus);

module.exports = router;
