import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', bio: user?.bio || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await usersAPI.updateProfile(form);
      updateUser(data.user);
      setEditing(false);
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.includes('Error') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
          {message}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-600 px-8 py-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-300 capitalize">{user?.role}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</p>
                  <p className="text-gray-900 dark:text-white mt-1">{user?.firstName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</p>
                  <p className="text-gray-900 dark:text-white mt-1">{user?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-gray-900 dark:text-white mt-1">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                  <p className="text-gray-900 dark:text-white mt-1 capitalize">{user?.role}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-gray-900 dark:text-white mt-1">{user?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member Since</p>
                  <p className="text-gray-900 dark:text-white mt-1">{new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              {user?.bio && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bio</p>
                  <p className="text-gray-900 dark:text-white mt-1">{user.bio}</p>
                </div>
              )}
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
