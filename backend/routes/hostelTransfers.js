const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/hostelTransferController');

router.post('/', authenticate, authorizeRoles('student'), ctrl.create);
router.get('/my', authenticate, authorizeRoles('student'), ctrl.getMyTransfers);
router.get('/', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.getAll);
router.patch('/:id/review', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.review);

module.exports = router;
