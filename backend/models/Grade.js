const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  maxScore: { type: Number, default: 100 },
  grade: { type: String, default: '' },
  term: { type: String, default: '' },
  comments: { type: String, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

gradeSchema.pre('save', function(next) {
  const pct = (this.score / this.maxScore) * 100;
  if (pct >= 90) this.grade = 'A';
  else if (pct >= 80) this.grade = 'B';
  else if (pct >= 70) this.grade = 'C';
  else if (pct >= 60) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
