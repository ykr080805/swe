const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/assetController');

router.post('/', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.create);
router.get('/', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.getAll);
router.put('/:id', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.update);
router.patch('/:id/maintenance', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.logMaintenance);
router.delete('/:id', authenticate, authorizeRoles('admin', 'hostel_staff'), ctrl.remove);

module.exports = router;
