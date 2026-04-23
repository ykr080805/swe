const Resource = require('../models/Resource');
const path = require('path');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const resource = await Resource.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description,
      courseOffering: req.params.courseOfferingId,
      uploadedBy: req.user.userId,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      category: req.body.category || 'other'
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload resource' });
  }
};

exports.getByCourse = async (req, res) => {
  try {
    const resources = await Resource.find({ courseOffering: req.params.courseOfferingId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

exports.download = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.download(path.resolve(resource.filePath), resource.fileName);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download resource' });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    if (req.user.role !== 'admin' && resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this resource' });
    }
    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
