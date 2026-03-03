import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import Modal from '../components/Modal';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState({ title: '', description: '', date: '', endDate: '', type: 'event', location: '' });

  const canManage = user?.role === 'teacher' || user?.role === 'admin';

  const fetchEvents = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filterType) params.type = filterType;
      const { data } = await eventsAPI.getAll(params);
      setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openCreate = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', date: '', endDate: '', type: 'event', location: '' });
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title, description: event.description || '', date: event.date?.slice(0, 10) || '',
      endDate: event.endDate?.slice(0, 10) || '', type: event.type, location: event.location || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.endDate) delete payload.endDate;
      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, payload);
      } else {
        await eventsAPI.create(payload);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      fetchEvents();
    } catch (err) {
      alert('Error deleting event');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isPast = (date) => new Date(date) < new Date();

  const typeColors = {
    event: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    deadline: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    reminder: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    holiday: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";

  // Calendar view helpers
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date?.slice(0, 10) === dateStr);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events & Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>List</button>
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Calendar</button>
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none">
            <option value="">All Types</option>
            <option value="event">Events</option>
            <option value="deadline">Deadlines</option>
            <option value="reminder">Reminders</option>
            <option value="holiday">Holidays</option>
          </select>
          {canManage && (
            <button onClick={openCreate} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              New Event
            </button>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="font-semibold text-gray-900 dark:text-white">{monthName}</h3>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 dark:border-gray-800" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
              return (
                <div key={day} className={`min-h-[80px] p-1 border-b border-r border-gray-100 dark:border-gray-800 ${isToday ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${isToday ? 'bg-black dark:bg-white text-white dark:text-black font-bold' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
                  {dayEvents.map(ev => (
                    <div key={ev._id} className={`mt-0.5 px-1 py-0.5 rounded text-[10px] font-medium truncate ${typeColors[ev.type]}`}>{ev.title}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-6 py-12 text-center text-gray-500 dark:text-gray-400">No events found</div>
          ) : (
            events.map(event => (
              <div key={event._id} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all ${isPast(event.date) ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[event.type]}`}>{event.type}</span>
                    </div>
                    {event.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{event.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(event.date)}{event.endDate ? ` — ${formatDate(event.endDate)}` : ''}</span>
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => openEdit(event)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? 'Edit Event' : 'New Event'} size="md">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date (optional)</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                <option value="event">Event</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Reminder</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              {editingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Events;
