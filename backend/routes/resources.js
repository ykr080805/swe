const router = require('express').Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/resourceController');
const upload = require('../config/multerConfig');

// Specific routes BEFORE dynamic /:courseOfferingId to prevent shadowing
router.get('/download/:id', authenticate, ctrl.download);

router.post('/:courseOfferingId', authenticate, authorizeRoles('faculty', 'admin'), upload.single('file'), ctrl.upload);
router.get('/:courseOfferingId', authenticate, ctrl.getByCourse);
router.delete('/:id', authenticate, authorizeRoles('faculty', 'admin'), ctrl.deleteOne);

module.exports = router;
