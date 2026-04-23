const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/announcementController');

router.post('/', authenticate, authorizeRoles('faculty', 'admin'), ctrl.create);
router.get('/', authenticate, ctrl.getAll);
router.delete('/:id', authenticate, authorizeRoles('faculty', 'admin'), ctrl.deleteOne);

module.exports = router;
