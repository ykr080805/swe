const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/noDuesController');

router.get('/my', authenticate, authorizeRoles('student'), ctrl.getMyNoDues);
router.get('/', authenticate, authorizeRoles('admin'), ctrl.getAll);
router.patch('/:studentId/items/:itemId/clear', authenticate, authorizeRoles('admin'), ctrl.clearItem);

module.exports = router;
