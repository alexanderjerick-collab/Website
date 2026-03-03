const express = require('express');
const { body, validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { student, subject, term, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (student) {
      filter.student = student;
    }
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (term) filter.term = term;
    const grades = await Grade.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('recordedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Grade.countDocuments(filter);
    res.json({ grades, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, authorize('teacher', 'admin'), [
  body('student').notEmpty().withMessage('Student is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('score').isNumeric().withMessage('Score must be a number'),
  body('maxScore').optional().isNumeric(),
  body('term').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const grade = await Grade.create({ ...req.body, recordedBy: req.user._id });
    await Notification.create({
      user: grade.student,
      title: 'New Grade Recorded',
      message: `A new grade has been recorded for ${grade.subject}: ${grade.score}/${grade.maxScore}`,
      type: 'grade',
      link: `/grades`
    });
    await logActivity(req.user._id, 'create', 'grade', grade._id, `Recorded grade for ${grade.subject}`);
    const populated = await grade.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'recordedBy', select: 'firstName lastName' }
    ]);
    res.status(201).json({ grade: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    Object.assign(grade, req.body);
    await grade.save();
    await logActivity(req.user._id, 'update', 'grade', grade._id, `Updated grade for ${grade.subject}`);
    const populated = await grade.populate([
      { path: 'student', select: 'firstName lastName email' },
      { path: 'recordedBy', select: 'firstName lastName' }
    ]);
    res.json({ grade: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    await logActivity(req.user._id, 'delete', 'grade', grade._id, `Deleted grade for ${grade.subject}`);
    res.json({ message: 'Grade deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
