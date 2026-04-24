const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: isDev ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min dev / 15 min prod
  max: isDev ? 100 : 15,                              // 100 attempts dev / 15 prod
  message: { error: 'Too many login attempts. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Successful logins don't count against the limit
});

module.exports = { authLimiter };
