const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/studentAssignmentController');

router.get('/', authenticate, authorizeRoles('student'), ctrl.getMyAttendance);

module.exports = router;
