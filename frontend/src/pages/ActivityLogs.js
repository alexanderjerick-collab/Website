import React, { useState, useEffect, useCallback } from 'react';
import { logsAPI } from '../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filterAction) params.action = filterAction;
      if (filterResource) params.resource = filterResource;
      const { data } = await logsAPI.getAll(params);
      setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterResource]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatDate = (date) => new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const actionColors = {
    create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    register: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System activity and audit trail</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="register">Register</option>
          </select>
          <select value={filterResource} onChange={(e) => setFilterResource(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Resources</option>
            <option value="user">User</option>
            <option value="task">Task</option>
            <option value="grade">Grade</option>
            <option value="event">Event</option>
            <option value="profile">Profile</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {logs.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No activity logs found</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map(log => (
              <div key={log._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-white dark:text-black text-xs font-bold">{log.user?.firstName?.[0]}{log.user?.lastName?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                        <span className="text-gray-500 dark:text-gray-400"> · {log.details || `${log.action} ${log.resource}`}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{log.action}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{log.resource}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
