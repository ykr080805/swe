const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/hmcController');

router.get('/', authenticate, authorizeRoles('admin'), ctrl.getAll);
router.post('/', authenticate, authorizeRoles('admin'), ctrl.add);
router.put('/:id', authenticate, authorizeRoles('admin'), ctrl.update);
router.delete('/:id', authenticate, authorizeRoles('admin'), ctrl.remove);

module.exports = router;
