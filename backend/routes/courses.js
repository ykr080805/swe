const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const courseController = require('../controllers/courseController');

// Student-accessible: must come before /:id patterns
router.get('/available', authenticate, courseController.getAvailableCourses);

// Admin catalog management
router.get('/', authenticate, authorizeRoles('admin', 'faculty'), courseController.getCourses);
router.post('/', authenticate, authorizeRoles('admin'), auditLogger('CREATE_COURSE'), courseController.createCourse);
router.put('/:id', authenticate, authorizeRoles('admin'), auditLogger('UPDATE_COURSE'), courseController.updateCourse);
router.post('/:id/offerings', authenticate, authorizeRoles('admin'), auditLogger('CREATE_OFFERING'), courseController.createOffering);
router.patch('/:id/retire', authenticate, authorizeRoles('admin'), auditLogger('RETIRE_COURSE'), courseController.retireCourse);

module.exports = router;
