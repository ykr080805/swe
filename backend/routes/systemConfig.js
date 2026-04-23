const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/systemConfigController');

router.get('/', authenticate, authorizeRoles('admin'), ctrl.getConfig);
router.put('/', authenticate, authorizeRoles('admin'), ctrl.updateConfig);

module.exports = router;
