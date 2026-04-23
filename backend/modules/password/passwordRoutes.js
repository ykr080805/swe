// Day 5: Password Routing Layer
const express = require('express');
const router = express.Router();
const passwordController = require('./passwordController');
const { authenticate } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');

// Mock external rate Limiter import for routing
const authLimiter = (req, res, next) => next(); 

// Forgot Password Flow (Rate Limited to prevent spam)
router.post('/forgot-password', authLimiter, auditLogger('FORGOT_PASSWORD'), passwordController.forgotPassword);

// Reset Password Flow (Using emailed token)
router.post('/reset-password', authLimiter, auditLogger('RESET_PASSWORD'), passwordController.resetPassword);

// Change Password Flow (For already logged in users)
router.put('/change-password', authenticate, auditLogger('CHANGE_PASSWORD'), passwordController.changePassword);

module.exports = router;
