const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/complaintController');

router.post('/', authenticate, authorizeRoles('student'), ctrl.create);
router.get('/my', authenticate, authorizeRoles('student'), ctrl.getMyComplaints);
router.get('/', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.getAll);
router.patch('/:id/status', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.updateStatus);

module.exports = router;
