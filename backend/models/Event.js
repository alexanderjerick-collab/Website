const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  endDate: { type: Date },
  type: { type: String, enum: ['event', 'deadline', 'reminder', 'holiday'], default: 'event' },
  location: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
