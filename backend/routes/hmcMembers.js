const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/hmcController');

router.get('/', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.getAll);
router.post('/', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.add);
router.put('/:id', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.update);
router.delete('/:id', authenticate, authorizeRoles('hmc_member', 'hostel_staff'), ctrl.remove);

module.exports = router;
