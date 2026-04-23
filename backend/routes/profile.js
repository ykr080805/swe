const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');
const profileController = require('../controllers/profileController');

router.get('/', authenticate, profileController.getProfile);

router.put('/', authenticate, auditLogger('UPDATE_PROFILE'), profileController.updateProfile);

module.exports = router;
