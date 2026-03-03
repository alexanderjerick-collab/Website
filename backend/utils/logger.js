const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, resource, resourceId = null, details = '', ipAddress = '') => {
  try {
    await ActivityLog.create({ user: userId, action, resource, resourceId, details, ipAddress });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = { logActivity };
