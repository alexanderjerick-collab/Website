import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const isAdmin = user?.role === 'admin';

  const fetchUsers = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (u) => {
    if (!isAdmin) return;
    try {
      await usersAPI.update(u._id, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      alert('Error updating user');
    }
  };

  const handleChangeRole = async (u, newRole) => {
    if (!isAdmin) return;
    try {
      await usersAPI.update(u._id, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Error updating role');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin || !window.confirm('Delete this user permanently?')) return;
    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    teacher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    student: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none w-40" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                {isAdmin && <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-white dark:text-black text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-6 py-3">
                    {isAdmin ? (
                      <select value={u.role} onChange={(e) => handleChangeRole(u, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer ${roleColors[u.role]}`}>
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => isAdmin && handleToggleActive(u)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'cursor-pointer' : ''} ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleDelete(u._id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete user">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
