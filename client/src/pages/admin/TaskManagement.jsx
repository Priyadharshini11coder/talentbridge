import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import {
  CheckSquare,
  PlusCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  FileCheck
} from 'lucide-react';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'submissions'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    priority: 'Medium'
  });

  const [reviewForm, setReviewForm] = useState({
    status: 'Approved',
    feedback: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [tasksRes, subsRes, internsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/submissions'),
        api.get('/interns')
      ]);
      setTasks(tasksRes.data || []);
      setSubmissions(subsRes.data || []);
      setInterns(internsRes.data || []);
      if (internsRes.data?.length > 0 && !createForm.assignedTo) {
        setCreateForm(prev => ({ ...prev, assignedTo: internsRes.data[0].id || internsRes.data[0]._id }));
      }
    } catch (err) {
      setError('Failed to fetch task records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.title || !createForm.assignedTo) {
      setError('Please provide task title and assign to an intern.');
      return;
    }

    try {
      await api.post('/tasks', createForm);
      setMessage('Task created and assigned successfully!');
      setIsCreateOpen(false);
      setCreateForm({
        title: '',
        description: '',
        assignedTo: interns[0]?.id || interns[0]?._id || '',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        priority: 'Medium'
      });
      await fetchData();
    } catch (err) {
      setError('Failed to create task.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      await api.put(`/tasks/${selectedTask.id || selectedTask._id}`, selectedTask);
      setMessage('Task updated successfully!');
      setIsEditOpen(false);
      await fetchData();
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setMessage('Task deleted.');
      await fetchData();
    } catch (err) {
      setError('Failed to delete task.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.put(`/submissions/${selectedSubmission.id || selectedSubmission._id}/review`, reviewForm);
      setMessage(`Deliverable marked as ${reviewForm.status}! Dynamic performance score updated.`);
      setIsReviewOpen(false);
      await fetchData();
    } catch (err) {
      setError('Failed to submit review.');
    }
  };

  const openReview = (submission) => {
    setSelectedSubmission(submission);
    setReviewForm({
      status: submission.status === 'Approved' ? 'Approved' : 'Approved',
      feedback: submission.feedback || ''
    });
    setIsReviewOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Task & Deliverables Management 📋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Assign milestones, evaluate submissions, give feedback and approve deliverables
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#131b2e] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tasks' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'submissions' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Submissions Queue ({submissions.length})
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/30 flex items-center gap-2 text-xs sm:text-sm active:scale-95"
          >
            <PlusCircle size={16} /> Create Task
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

      {activeTab === 'tasks' ? (
        /* Tasks List Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.length === 0 ? (
            <div className="col-span-full rounded-2xl p-8 bg-[#131b2e] border border-slate-800 text-center text-slate-400">
              No tasks currently created. Click "Create Task" to assign one to an intern.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id || task._id}
                className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'High' ? 'bg-red-950 text-red-300 border border-red-800' :
                      task.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {task.dueDate}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned To:</span>
                    <span className="font-bold text-purple-300">{task.internName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      task.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      task.status === 'Submitted' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      task.status === 'In Progress' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setSelectedTask({ ...task }); setIsEditOpen(true); }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Task"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id || task._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Submissions Review Queue Tab */
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl p-8 bg-[#131b2e] border border-slate-800 text-center text-slate-400">
              No submissions currently waiting for review.
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id || sub._id}
                className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{sub.taskTitle}</h3>
                    <p className="text-xs text-purple-300 mt-0.5">Submitted by: <strong>{sub.internName}</strong></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {new Date(sub.submittedAt).toLocaleString()}
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

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Intern Description / Work Remarks
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed bg-[#172236] p-3.5 rounded-xl border border-slate-700/60">
                    {sub.remarks}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div>
                    {sub.submissionLink ? (
                      <a
                        href={sub.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 underline"
                      >
                        <ExternalLink size={14} /> Open Deliverable Link ({sub.submissionLink})
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No link provided</span>
                    )}
                  </div>

                  <button
                    onClick={() => openReview(sub)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5 shadow"
                  >
                    <FileCheck size={14} /> Review & Grade Deliverable
                  </button>
                </div>

                {sub.feedback && (
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                    <strong>Admin Feedback:</strong> {sub.feedback}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Create Task */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create & Assign Milestone Task">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Build REST API for Attendance Management"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Detailed instructions, requirements and acceptance criteria..."
              className="w-full p-3.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign To Intern *</label>
            <select
              required
              value={createForm.assignedTo}
              onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
            >
              {interns.map((i) => (
                <option key={i.id || i._id} value={i.id || i._id}>
                  {i.name} ({i.college || 'Intern'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Task */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task Details">
        {selectedTask && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                required
                value={selectedTask.title}
                onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={selectedTask.description || ''}
                onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={selectedTask.dueDate}
                  onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={selectedTask.status}
                onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Review Deliverable */}
      <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Evaluate & Review Deliverable">
        {selectedSubmission && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs text-slate-400">Milestone: <strong className="text-white">{selectedSubmission.taskTitle}</strong></p>
              <p className="text-xs text-slate-400">Student: <strong className="text-purple-300">{selectedSubmission.internName}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Evaluation Verdict *</label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              >
                <option value="Approved">Approved (Marks task Completed)</option>
                <option value="Needs Revision">Needs Revision (Send back to intern)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback & Notes for Student</label>
              <textarea
                rows={3}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                placeholder="Give constructive feedback on their deliverable..."
                className="w-full p-3 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
              >
                Confirm Review
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
