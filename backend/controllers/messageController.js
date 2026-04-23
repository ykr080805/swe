const Message = require('../models/Message');

exports.send = async (req, res) => {
  try {
    const { recipient, subject, body, threadId } = req.body;
    const message = await Message.create({
      sender: req.user.userId,
      recipient,
      subject,
      body,
      threadId
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user.userId,
      deletedByRecipient: false
    })
      .populate('sender', 'name userId role')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
};

exports.getSent = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user.userId,
      deletedBySender: false
    })
      .populate('recipient', 'name userId role')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent messages' });
  }
};

exports.getThread = async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId })
      .populate('sender', 'name userId role')
      .populate('recipient', 'name userId role')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (msg.sender.toString() === req.user.userId) {
      msg.deletedBySender = true;
    }
    if (msg.recipient.toString() === req.user.userId) {
      msg.deletedByRecipient = true;
    }
    await msg.save();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
