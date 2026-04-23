const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/messageController');

router.post('/', authenticate, ctrl.send);
router.get('/inbox', authenticate, ctrl.getInbox);
router.get('/sent', authenticate, ctrl.getSent);
router.get('/thread/:threadId', authenticate, ctrl.getThread);
router.patch('/:id/read', authenticate, ctrl.markRead);
router.delete('/:id', authenticate, ctrl.deleteMessage);

module.exports = router;
