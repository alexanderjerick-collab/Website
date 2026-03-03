const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'student') {
      filter.assignedTo = req.user._id;
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'student' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, authorize('teacher', 'admin'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('subject').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await Notification.create({
      user: task.assignedTo,
      title: 'New Task Assigned',
      message: `You have a new task: ${task.title}`,
      type: 'task',
      link: `/tasks`
    });
    await logActivity(req.user._id, 'create', 'task', task._id, `Created task: ${task.title}`);
    const populated = await task.populate([
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    res.status(201).json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role === 'student') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const allowedUpdates = { status: req.body.status };
      if (req.body.status === 'completed') allowedUpdates.completedAt = new Date();
      Object.assign(task, allowedUpdates);
    } else {
      if (req.body.status === 'completed' && task.status !== 'completed') {
        req.body.completedAt = new Date();
      }
      Object.assign(task, req.body);
    }
    await task.save();
    await logActivity(req.user._id, 'update', 'task', task._id, `Updated task: ${task.title}`);
    const populated = await task.populate([
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);
    res.json({ task: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await logActivity(req.user._id, 'delete', 'task', task._id, `Deleted task: ${task.title}`);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
