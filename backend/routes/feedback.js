const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

// Faculty: manage feedback windows
router.post('/courses/:courseOfferingId/window', authenticate, authorizeRoles('faculty', 'admin'), ctrl.openWindow);
router.patch('/window/:windowId/close', authenticate, authorizeRoles('faculty', 'admin'), ctrl.closeWindow);
router.get('/courses/:courseOfferingId/results', authenticate, authorizeRoles('faculty', 'admin'), ctrl.getResults);

// Student: submit feedback
router.get('/courses/:courseOfferingId/active', authenticate, authorizeRoles('student'), ctrl.getActiveWindow);
router.post('/courses/:courseOfferingId/submit', authenticate, authorizeRoles('student'), ctrl.submitFeedback);

// Admin: system-wide evaluation
router.get('/all', authenticate, authorizeRoles('admin'), ctrl.getAllFeedback);

module.exports = router;
