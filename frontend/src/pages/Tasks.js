import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI } from '../services/api';
import Modal from '../components/Modal';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', subject: '', assignedTo: '', status: 'pending' });

  const canManage = user?.role === 'teacher' || user?.role === 'admin';

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.priority) params.priority = filter.priority;
      params.limit = 100;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    if (canManage) {
      usersAPI.getAll({ role: 'student', limit: 100 }).then(({ data }) => setStudents(data.users)).catch(() => {});
    }
  }, [canManage]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', subject: '', assignedTo: '', status: 'pending' });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title, description: task.description || '', dueDate: task.dueDate?.slice(0, 10) || '',
      priority: task.priority, subject: task.subject || '', assignedTo: task.assignedTo?._id || '', status: task.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask._id, form);
      } else {
        await tasksAPI.create(form);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error saving task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await tasksAPI.update(task._id, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Error updating task');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isOverdue = (task) => task.status !== 'completed' && new Date(task.dueDate) < new Date();

  const priorityColors = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {canManage && (
            <button onClick={openCreate} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              New Task
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {tasks.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No tasks found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Assigned To</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map(task => (
                  <tr key={task._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-3">
                      <p className={`text-sm font-medium text-gray-900 dark:text-white ${task.status === 'completed' ? 'line-through' : ''}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{task.subject || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 hidden lg:table-cell">{task.assignedTo?.firstName} {task.assignedTo?.lastName}</td>
                    <td className="px-6 py-3">
                      <span className={`text-sm ${isOverdue(task) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => toggleComplete(task)} className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <>
                            <button onClick={() => openEdit(task)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(task._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'New Task'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign To</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} required className={inputClass}>
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          {editingTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
