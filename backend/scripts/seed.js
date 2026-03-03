require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Grade = require('../models/Grade');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jericktm';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Task.deleteMany({});
    await Grade.deleteMany({});
    await Event.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      firstName: 'Admin', lastName: 'User', email: 'admin@jericktm.com',
      password: 'admin123', role: 'admin', bio: 'System Administrator'
    });
    const teacher1 = await User.create({
      firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@jericktm.com',
      password: 'teacher123', role: 'teacher', bio: 'Mathematics Teacher'
    });
    const teacher2 = await User.create({
      firstName: 'Michael', lastName: 'Brown', email: 'michael@jericktm.com',
      password: 'teacher123', role: 'teacher', bio: 'Science Teacher'
    });
    const student1 = await User.create({
      firstName: 'John', lastName: 'Doe', email: 'john@jericktm.com',
      password: 'student123', role: 'student', bio: 'Grade 10 Student'
    });
    const student2 = await User.create({
      firstName: 'Jane', lastName: 'Smith', email: 'jane@jericktm.com',
      password: 'student123', role: 'student', bio: 'Grade 10 Student'
    });
    const student3 = await User.create({
      firstName: 'Alex', lastName: 'Wilson', email: 'alex@jericktm.com',
      password: 'student123', role: 'student', bio: 'Grade 11 Student'
    });
    console.log('Users created');

    const now = new Date();
    const tasks = await Task.insertMany([
      { title: 'Math Homework Ch.5', description: 'Complete exercises 1-20 from Chapter 5', dueDate: new Date(now.getTime() + 2 * 86400000), priority: 'high', status: 'pending', subject: 'Mathematics', assignedTo: student1._id, createdBy: teacher1._id },
      { title: 'Science Lab Report', description: 'Write lab report for the chemistry experiment', dueDate: new Date(now.getTime() + 5 * 86400000), priority: 'medium', status: 'pending', subject: 'Science', assignedTo: student1._id, createdBy: teacher2._id },
      { title: 'Math Quiz Preparation', description: 'Study chapters 3-5 for upcoming quiz', dueDate: new Date(now.getTime() + 3 * 86400000), priority: 'high', status: 'in_progress', subject: 'Mathematics', assignedTo: student2._id, createdBy: teacher1._id },
      { title: 'Science Project Proposal', description: 'Submit project proposal for the science fair', dueDate: new Date(now.getTime() + 7 * 86400000), priority: 'medium', status: 'pending', subject: 'Science', assignedTo: student2._id, createdBy: teacher2._id },
      { title: 'Algebra Practice Set', description: 'Complete the algebra practice worksheet', dueDate: new Date(now.getTime() - 1 * 86400000), priority: 'low', status: 'completed', subject: 'Mathematics', assignedTo: student3._id, createdBy: teacher1._id, completedAt: new Date() },
      { title: 'Biology Reading', description: 'Read chapters 7-8 on cell biology', dueDate: new Date(now.getTime() + 4 * 86400000), priority: 'medium', status: 'pending', subject: 'Biology', assignedTo: student3._id, createdBy: teacher2._id },
      { title: 'History Essay', description: 'Write a 500-word essay on the Industrial Revolution', dueDate: new Date(now.getTime() + 10 * 86400000), priority: 'high', status: 'pending', subject: 'History', assignedTo: student1._id, createdBy: teacher1._id },
      { title: 'Physics Problem Set', description: 'Solve problems 1-15 on Newton\'s Laws', dueDate: new Date(now.getTime() + 6 * 86400000), priority: 'medium', status: 'in_progress', subject: 'Physics', assignedTo: student2._id, createdBy: teacher2._id }
    ]);
    console.log('Tasks created');

    await Grade.insertMany([
      { student: student1._id, subject: 'Mathematics', score: 92, maxScore: 100, term: 'Term 1', comments: 'Excellent work', recordedBy: teacher1._id },
      { student: student1._id, subject: 'Science', score: 85, maxScore: 100, term: 'Term 1', comments: 'Good understanding', recordedBy: teacher2._id },
      { student: student1._id, subject: 'History', score: 78, maxScore: 100, term: 'Term 1', comments: 'Needs improvement in essay writing', recordedBy: teacher1._id },
      { student: student2._id, subject: 'Mathematics', score: 88, maxScore: 100, term: 'Term 1', comments: 'Very good', recordedBy: teacher1._id },
      { student: student2._id, subject: 'Science', score: 95, maxScore: 100, term: 'Term 1', comments: 'Outstanding performance', recordedBy: teacher2._id },
      { student: student2._id, subject: 'Physics', score: 72, maxScore: 100, term: 'Term 1', comments: 'Needs more practice', recordedBy: teacher2._id },
      { student: student3._id, subject: 'Mathematics', score: 65, maxScore: 100, term: 'Term 1', comments: 'Satisfactory', recordedBy: teacher1._id },
      { student: student3._id, subject: 'Biology', score: 90, maxScore: 100, term: 'Term 1', comments: 'Excellent lab work', recordedBy: teacher2._id },
      { student: student1._id, subject: 'Mathematics', score: 95, maxScore: 100, term: 'Term 2', comments: 'Improved significantly', recordedBy: teacher1._id },
      { student: student2._id, subject: 'Mathematics', score: 91, maxScore: 100, term: 'Term 2', comments: 'Consistent performance', recordedBy: teacher1._id }
    ]);
    console.log('Grades created');

    await Event.insertMany([
      { title: 'Mid-Term Examinations', description: 'Mid-term exams for all subjects', date: new Date(now.getTime() + 14 * 86400000), endDate: new Date(now.getTime() + 19 * 86400000), type: 'event', location: 'Main Hall', createdBy: admin._id },
      { title: 'Science Fair', description: 'Annual school science fair', date: new Date(now.getTime() + 30 * 86400000), type: 'event', location: 'Gymnasium', createdBy: teacher2._id },
      { title: 'Math Quiz', description: 'Chapter 5 quiz for all math classes', date: new Date(now.getTime() + 3 * 86400000), type: 'deadline', createdBy: teacher1._id },
      { title: 'Parent-Teacher Meeting', description: 'Quarterly parent-teacher conference', date: new Date(now.getTime() + 21 * 86400000), type: 'event', location: 'Auditorium', createdBy: admin._id },
      { title: 'Spring Break', description: 'School closed for spring break', date: new Date(now.getTime() + 45 * 86400000), endDate: new Date(now.getTime() + 52 * 86400000), type: 'holiday', createdBy: admin._id },
      { title: 'Project Submission Deadline', description: 'Final deadline for science project submissions', date: new Date(now.getTime() + 10 * 86400000), type: 'deadline', createdBy: teacher2._id },
      { title: 'Sports Day', description: 'Annual inter-house sports competition', date: new Date(now.getTime() + 25 * 86400000), type: 'event', location: 'Sports Ground', createdBy: admin._id }
    ]);
    console.log('Events created');

    await Notification.insertMany([
      { user: student1._id, title: 'New Task Assigned', message: 'You have a new math homework assignment', type: 'task', link: '/tasks' },
      { user: student1._id, title: 'Grade Recorded', message: 'Your Mathematics grade for Term 2 has been recorded', type: 'grade', link: '/grades' },
      { user: student2._id, title: 'Upcoming Deadline', message: 'Math Quiz is in 3 days', type: 'event', link: '/events' },
      { user: student1._id, title: 'Task Overdue', message: 'Your Science Lab Report is overdue', type: 'task', read: true, link: '/tasks' }
    ]);
    console.log('Notifications created');

    console.log('\n=== Seed Complete ===');
    console.log('Login credentials:');
    console.log('  Admin:   admin@jericktm.com / admin123');
    console.log('  Teacher: sarah@jericktm.com / teacher123');
    console.log('  Teacher: michael@jericktm.com / teacher123');
    console.log('  Student: john@jericktm.com / student123');
    console.log('  Student: jane@jericktm.com / student123');
    console.log('  Student: alex@jericktm.com / student123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
