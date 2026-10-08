import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { User, Mail, Phone, GraduationCap, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    college: user?.college || '',
    course: user?.course || ''
  });

  const [metrics, setMetrics] = useState({
    attendanceCount: 0,
    tasksCount: 0,
    performanceScore: 0
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        course: user.course || ''
      });

      // Fetch user metrics for Profile page matching Screenshot 4
      async function fetchMetrics() {
        try {
          const res = await api.get('/dashboard/stats');
          const stats = res.data.stats;
          setMetrics({
            attendanceCount: stats.attendanceRecordsCount || 0,
            tasksCount: (stats.submittedTasks || 0) + (stats.completedTasks || 0),
            performanceScore: stats.performanceScore || 0
          });
        } catch (err) {
          console.error('Error loading profile stats');
        }
      }
      fetchMetrics();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile(formData);
      setSuccessMsg('Profile changes saved successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header matching Screenshot 4 */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Student Profile 👤
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal information and view your verified internship standing
        </p>
      </div>

      {successMsg && (
        <div className="max-w-xl p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="max-w-xl p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Main Profile Card replicating Screenshot 4 */}
      <div className="max-w-xl bg-[#131b2e] border border-slate-800 rounded-2xl p-8 sm:p-9 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Phone field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* College and Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                College
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          {/* Readonly Informational Standing Rows matching Screenshot 4 */}
          <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200">Role:</span>
              <span className="font-bold text-purple-400 capitalize">Intern</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200">Attendance:</span>
              <span className="font-bold text-white">{metrics.attendanceCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200">Tasks Submitted:</span>
              <span className="font-bold text-white">{metrics.tasksCount}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200">Performance Score:</span>
              <span className="font-bold text-emerald-400">{metrics.performanceScore}</span>
            </div>
          </div>

          {/* Save Changes Purple Button matching Screenshot 4 */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30 text-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
