const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, resource, user, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (user) filter.user = user;
    const logs = await ActivityLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
