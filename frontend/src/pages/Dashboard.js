import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, gradesAPI, eventsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tasks: [], grades: [], events: [], taskStats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, gradesRes, eventsRes] = await Promise.all([
          tasksAPI.getAll({ limit: 5 }),
          gradesAPI.getAll({ limit: 5 }),
          eventsAPI.getAll({ limit: 5 })
        ]);
        const allTasks = (await tasksAPI.getAll({ limit: 100 })).data;
        const taskStats = {
          total: allTasks.total,
          pending: allTasks.tasks.filter(t => t.status === 'pending').length,
          inProgress: allTasks.tasks.filter(t => t.status === 'in_progress').length,
          completed: allTasks.tasks.filter(t => t.status === 'completed').length,
          overdue: allTasks.tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length
        };
        setStats({
          tasks: tasksRes.data.tasks,
          grades: gradesRes.data.grades,
          events: eventsRes.data.events,
          taskStats
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.firstName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-all hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.taskStats.total || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-all hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.taskStats.inProgress || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-all hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.taskStats.completed || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 transition-all hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.taskStats.overdue || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.tasks.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
            ) : (
              stats.tasks.map(task => (
                <div key={task._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Due: {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {stats.events.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No upcoming events</p>
            ) : (
              stats.events.map(event => (
                <div key={event._id} className="px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.type === 'deadline' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      event.type === 'holiday' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>{event.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(event.date)}{event.location ? ` · ${event.location}` : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Grades */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Grades</h2>
          <Link to="/grades" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">View all</Link>
        </div>
        {stats.grades.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No grades recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Term</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {stats.grades.map(grade => (
                  <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{grade.subject}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{grade.student?.firstName} {grade.student?.lastName}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white font-medium">{grade.score}/{grade.maxScore}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        grade.grade === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        grade.grade === 'B' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        grade.grade === 'C' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>{grade.grade}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{grade.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
