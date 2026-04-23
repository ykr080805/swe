const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/logs', authenticate, authorizeRoles('admin'), adminController.getLogs);

router.get('/logs/:userId', authenticate, authorizeRoles('admin'), adminController.getUserLogs);

module.exports = router;
