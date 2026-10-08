import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CheckSquare, ExternalLink, Clock, AlertCircle, CheckCircle2, MessageSquare, ListFilter } from 'lucide-react';

export default function TasksPage() {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state matching Screenshot 5
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'assigned'

  const fetchData = async () => {
    try {
      const [tasksRes, subsRes] = await api.get('/tasks'), subsData = await api.get('/submissions');
      setAssignedTasks(tasksRes.data || []);
      setSubmissions(subsData.data || []);
    } catch (err) {
      setError('Failed to load task records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!workDescription.trim() && !submissionLink.trim()) {
      setError('Please provide a description of today\'s work or a submission link.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/submissions', {
        taskId: selectedTaskId || undefined,
        remarks: workDescription,
        submissionLink
      });

      setMessage('Task submitted successfully! Admin will review your work.');
      setWorkDescription('');
      setSubmissionLink('');
      setSelectedTaskId('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      setError('Failed to update task status.');
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
      {/* Header matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Task Submission 📝
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit and track your daily internship tasks.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-2 bg-[#131b2e] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'submit' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submit Work
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'assigned' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Assigned Tasks ({assignedTasks.length})
          </button>
        </div>
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

      {activeTab === 'submit' ? (
        <>
          {/* Large Vibrant Purple Submission Card replicating Screenshot 5 */}
          <div className="rounded-2xl p-6 sm:p-8 bg-[#8b5cf6] text-white shadow-2xl">
            <h2 className="text-xl font-bold mb-4 tracking-tight">Today's Work</h2>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              {/* Optional task link selector */}
              {assignedTasks.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-purple-100 mb-1">
                    Select Milestone / Task (Optional):
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-800/80 border border-purple-400/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <option value="">General Daily Task / Milestone</option>
                    {assignedTasks.map((t) => (
                      <option key={t.id || t._id} value={t.id || t._id}>
                        {t.title} (Status: {t.status} | Due: {t.dueDate})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Work description textarea */}
              <div>
                <textarea
                  rows={4}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Describe today's work..."
                  className="w-full p-4 rounded-xl bg-purple-950/50 border border-purple-400/40 text-white placeholder-purple-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
                />
              </div>

              {/* Submission URL link */}
              <div>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="Submission Link (GitHub repo, PR URL, Google Drive or Figma)"
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/50 border border-purple-400/40 text-white placeholder-purple-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-white transition"
                />
              </div>

              {/* White Button matching Screenshot 5 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-white text-purple-900 hover:bg-slate-100 transition shadow-md active:scale-95 disabled:opacity-50 text-sm inline-flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Task'}
              </button>
            </form>
          </div>

          {/* Submitted Tasks Section matching Screenshot 5 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Submitted Tasks</h2>

            {submissions.length === 0 ? (
              /* Empty state matching Screenshot 5 */
              <div className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 text-slate-400 text-sm">
                No tasks submitted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id || sub._id}
                    className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 shadow-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">
                        {sub.taskTitle || 'Daily Task Work'}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          sub.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          sub.status === 'Needs Revision' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed bg-[#0b101b] p-3.5 rounded-xl border border-slate-800/80">
                      {sub.remarks}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      {sub.submissionLink ? (
                        <a
                          href={sub.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 underline"
                        >
                          <ExternalLink size={13} /> View Deliverable Artifact
                        </a>
                      ) : (
                        <span className="text-slate-500">No external link attached</span>
                      )}

                      {sub.feedback && (
                        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 flex items-start gap-2 w-full mt-2">
                          <MessageSquare size={14} className="shrink-0 mt-0.5 text-purple-400" />
                          <div>
                            <span className="font-bold">Admin Feedback: </span>
                            <span>{sub.feedback}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Assigned Tasks List View */
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Assigned Tasks & Milestones</h2>

          {assignedTasks.length === 0 ? (
            <div className="rounded-2xl p-8 bg-[#131b2e] border border-slate-800 text-center text-slate-400 text-sm">
              No tasks currently assigned by administrator.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTasks.map((t) => (
                <div
                  key={t.id || t._id}
                  className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === 'High' ? 'bg-red-950 text-red-300 border border-red-800' :
                        t.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {t.priority} Priority
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> Due: {t.dueDate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{t.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      t.status === 'Submitted' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      t.status === 'In Progress' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>

                    {t.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id || t._id, 'In Progress')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
                      >
                        Start Task
                      </button>
                    )}

                    {(t.status === 'Pending' || t.status === 'In Progress') && (
                      <button
                        onClick={() => {
                          setSelectedTaskId(t.id || t._id);
                          setActiveTab('submit');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition"
                      >
                        Submit Deliverable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
