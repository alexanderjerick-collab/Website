const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { type, from, to, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Event.countDocuments(filter);
    res.json({ events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, authorize('teacher', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').optional().isIn(['event', 'deadline', 'reminder', 'holiday'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    await logActivity(req.user._id, 'create', 'event', event._id, `Created event: ${event.title}`);
    const populated = await event.populate('createdBy', 'firstName lastName');
    res.status(201).json({ event: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('createdBy', 'firstName lastName');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await logActivity(req.user._id, 'update', 'event', event._id, `Updated event: ${event.title}`);
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await logActivity(req.user._id, 'delete', 'event', event._id, `Deleted event: ${event.title}`);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
