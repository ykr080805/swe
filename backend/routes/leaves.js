const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/leaveController');

router.post('/', authenticate, authorizeRoles('student'), ctrl.create);
router.get('/my', authenticate, authorizeRoles('student'), ctrl.getMyLeaves);
router.get('/', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.getAll);
router.patch('/:id/review', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.review);

module.exports = router;
