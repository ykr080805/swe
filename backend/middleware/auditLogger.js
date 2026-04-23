const AuditLog = require('../models/AuditLog');

const auditLogger = (action) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        await AuditLog.create({
          userId: req.user ? req.user.userId : null,
          action,
          targetResource: req.originalUrl,
          ipAddress: req.ip,
          outcome: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE'
        });
      } catch (err) {
        console.error('Audit Log Error:', err);
      }
    });
    next();
  };
};

module.exports = auditLogger;
