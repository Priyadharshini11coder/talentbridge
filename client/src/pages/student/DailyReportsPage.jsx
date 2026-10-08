import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FileText, Send, Calendar, Lightbulb, AlertCircle, Compass, CheckCircle2 } from 'lucide-react';

export default function DailyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workCompleted: '',
    skillsLearned: '',
    challenges: '',
    tomorrowPlan: ''
  });

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data || []);
    } catch (err) {
      setError('Failed to fetch past reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workCompleted.trim()) {
      setError('Please provide a summary of work completed today.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      await api.post('/reports', formData);
      setMessage('Daily progress report recorded and logged for evaluation!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        workCompleted: '',
        skillsLearned: '',
        challenges: '',
        tomorrowPlan: ''
      });
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit daily report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Daily Progress Reports 📑
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Document your daily work, technical competencies acquired, roadblocks, and goals
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Report Submission Form */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#131b2e] border border-slate-800 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-5 tracking-tight flex items-center gap-2">
          Submit Today's Report ✍️
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-400" /> Report Date *
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-purple-400" /> Work Completed Today *
            </label>
            <textarea
              rows={3}
              name="workCompleted"
              required
              value={formData.workCompleted}
              onChange={handleChange}
              placeholder="Detail the modules, features, or tickets you worked on today..."
              className="w-full p-4 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-400" /> Skills Learned / Tech Explored
              </label>
              <input
                type="text"
                name="skillsLearned"
                value={formData.skillsLearned}
                onChange={handleChange}
                placeholder="e.g. React custom hooks, Tailwind CSS flexbox, MongoDB indexing"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-400" /> Challenges / Blockers Faced
              </label>
              <input
                type="text"
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                placeholder="e.g. CORS preflight issues or state re-rendering cycle"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Compass size={14} className="text-blue-400" /> Tomorrow's Plan / Action Items
            </label>
            <input
              type="text"
              name="tomorrowPlan"
              value={formData.tomorrowPlan}
              onChange={handleChange}
              placeholder="e.g. Connect frontend to production database and run integration tests"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30 inline-flex items-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
          >
            <Send size={16} /> {isSubmitting ? 'Recording Report...' : 'Submit Daily Report'}
          </button>
        </form>
      </div>

      {/* Submitted Reports Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Your Submitted Reports History</h2>

        {reports.length === 0 ? (
          <div className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 text-slate-400 text-sm">
            No daily reports filed yet. Use the form above to submit your first report!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((r) => (
              <div
                key={r.id || r._id}
                className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-white text-base flex items-center gap-2">
                    <Calendar size={16} className="text-purple-400" /> Date: {r.date}
                  </span>
                  <span className="text-xs text-slate-400">
                    Logged: {new Date(r.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Work Completed
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed bg-[#172236] p-3.5 rounded-xl border border-slate-700/50">
                    {r.workCompleted}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {r.skillsLearned && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-amber-300 block mb-1">💡 Skills Learned:</span>
                      <span className="text-slate-300">{r.skillsLearned}</span>
                    </div>
                  )}

                  {r.challenges && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-rose-300 block mb-1">⚠️ Challenges:</span>
                      <span className="text-slate-300">{r.challenges}</span>
                    </div>
                  )}

                  {r.tomorrowPlan && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-blue-300 block mb-1">🎯 Next Plan:</span>
                      <span className="text-slate-300">{r.tomorrowPlan}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
