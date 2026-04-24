const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

// Admin: open/close feedback windows for any course offering
router.post('/courses/:courseOfferingId/window', authenticate, authorizeRoles('admin'), ctrl.openWindow);
router.patch('/window/:windowId/close', authenticate, authorizeRoles('admin'), ctrl.closeWindow);

// Faculty: view results for their own courses
router.get('/courses/:courseOfferingId/results', authenticate, authorizeRoles('faculty', 'admin'), ctrl.getResults);

// Student: submit feedback
router.get('/courses/:courseOfferingId/active', authenticate, authorizeRoles('student'), ctrl.getActiveWindow);
router.post('/courses/:courseOfferingId/submit', authenticate, authorizeRoles('student'), ctrl.submitFeedback);

// Admin: system-wide evaluation
router.get('/all', authenticate, authorizeRoles('admin'), ctrl.getAllFeedback);

module.exports = router;
