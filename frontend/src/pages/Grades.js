import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { gradesAPI, usersAPI } from '../services/api';
import Modal from '../components/Modal';

const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [form, setForm] = useState({ student: '', subject: '', score: '', maxScore: '100', term: '', comments: '' });

  const canManage = user?.role === 'teacher' || user?.role === 'admin';

  const fetchGrades = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filterSubject) params.subject = filterSubject;
      const { data } = await gradesAPI.getAll(params);
      setGrades(data.grades);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterSubject]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  useEffect(() => {
    if (canManage) {
      usersAPI.getAll({ role: 'student', limit: 100 }).then(({ data }) => setStudents(data.users)).catch(() => {});
    }
  }, [canManage]);

  const openCreate = () => {
    setEditingGrade(null);
    setForm({ student: '', subject: '', score: '', maxScore: '100', term: '', comments: '' });
    setModalOpen(true);
  };

  const openEdit = (grade) => {
    setEditingGrade(grade);
    setForm({
      student: grade.student?._id || '', subject: grade.subject, score: String(grade.score),
      maxScore: String(grade.maxScore), term: grade.term || '', comments: grade.comments || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, score: Number(form.score), maxScore: Number(form.maxScore) };
      if (editingGrade) {
        await gradesAPI.update(editingGrade._id, payload);
      } else {
        await gradesAPI.create(payload);
      }
      setModalOpen(false);
      fetchGrades();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving grade');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade?')) return;
    try {
      await gradesAPI.delete(id);
      fetchGrades();
    } catch (err) {
      alert('Error deleting grade');
    }
  };

  const gradeColor = (g) => {
    if (g === 'A') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (g === 'B') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (g === 'C') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (g === 'D') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin" /></div>;
  }

  const avgScore = grades.length > 0 ? (grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grades</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{grades.length} record{grades.length !== 1 ? 's' : ''} · Average: {avgScore}%</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text" placeholder="Filter by subject..." value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none w-40"
          />
          {canManage && (
            <button onClick={openCreate} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Record Grade
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {grades.length === 0 ? (
          <p className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No grades found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Term</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Comments</th>
                  {canManage && <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {grades.map(grade => (
                  <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{grade.student?.firstName} {grade.student?.lastName}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{grade.subject}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{grade.score}/{grade.maxScore}</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-black dark:bg-white rounded-full transition-all" style={{ width: `${(grade.score / grade.maxScore) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(grade.grade)}`}>{grade.grade}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{grade.term || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell truncate max-w-xs">{grade.comments || '—'}</td>
                    {canManage && (
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(grade)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(grade._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGrade ? 'Edit Grade' : 'Record Grade'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Student</label>
            <select value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required className={inputClass}>
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Score</label>
              <input type="number" min="0" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Score</label>
              <input type="number" min="1" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} required className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Term</label>
            <input type="text" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className={inputClass} placeholder="e.g. Term 1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Comments</label>
            <textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} rows={2} className={inputClass} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              {editingGrade ? 'Update' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Grades;
