import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import {
  Users,
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  GraduationCap
} from 'lucide-react';

export default function InternManagement() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    course: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    status: 'active'
  });

  const fetchInterns = async () => {
    try {
      const res = await api.get('/interns', {
        params: { search, status: statusFilter }
      });
      setInterns(res.data || []);
    } catch (err) {
      setError('Failed to fetch interns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [search, statusFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/interns', formData);
      setSuccess('Intern registered successfully!');
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', college: '', course: '' });
      await fetchInterns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add intern.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntern) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/interns/${selectedIntern.id || selectedIntern._id}`, editFormData);
      setSuccess('Intern details updated!');
      setIsEditOpen(false);
      await fetchInterns();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update intern.');
    }
  };

  const handleToggleStatus = async (intern) => {
    const newStatus = intern.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/interns/${intern.id || intern._id}`, { status: newStatus });
      await fetchInterns();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDeleteIntern = async (internId) => {
    if (!window.confirm('Are you sure you want to delete this intern? This will remove all their records.')) {
      return;
    }
    try {
      await api.delete(`/interns/${internId}`);
      setSuccess('Intern removed successfully.');
      await fetchInterns();
    } catch (err) {
      setError('Failed to delete intern.');
    }
  };

  const openEdit = (intern) => {
    setSelectedIntern(intern);
    setEditFormData({
      name: intern.name,
      email: intern.email,
      phone: intern.phone || '',
      college: intern.college || '',
      course: intern.course || '',
      status: intern.status || 'active'
    });
    setIsEditOpen(true);
  };

  const openDetails = (intern) => {
    setSelectedIntern(intern);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Intern Management 👥
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Register students, manage cohorts, track college affiliations and status
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 text-sm self-start sm:self-auto active:scale-95"
        >
          <PlusCircle size={17} /> Add New Intern
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, college..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Interns</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Interns Data Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#172236] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Intern Name</th>
                <th className="px-5 py-4">College / Course</th>
                <th className="px-5 py-4 text-center">Attendance %</th>
                <th className="px-5 py-4 text-center">Tasks</th>
                <th className="px-5 py-4 text-center">Performance</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    Loading interns records...
                  </td>
                </tr>
              ) : interns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No interns found matching filter. Click "Add New Intern" above.
                  </td>
                </tr>
              ) : (
                interns.map((intern) => (
                  <tr key={intern.id || intern._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-white">{intern.name}</p>
                        <p className="text-xs text-slate-400">{intern.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{intern.college || '—'}</p>
                        <p className="text-[11px] text-purple-300">{intern.course || '—'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-blue-400">{intern.attendanceScore}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-emerald-400">{intern.taskScore}%</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-950 text-purple-300 border border-purple-800">
                        {intern.overallScore} / 100
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(intern)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition ${
                          intern.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {intern.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {intern.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetails(intern)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-300 transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(intern)}
                          title="Edit Intern"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-blue-300 transition"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteIntern(intern.id || intern._id)}
                          title="Delete Intern"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Intern */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Intern">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Senthil Kumar"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="senthil@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Defaults to password123"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="PSG Tech"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course</label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                placeholder="B.Tech IT"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
            >
              Add Intern
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Intern */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Intern Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College</label>
              <input
                type="text"
                value={editFormData.college}
                onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course</label>
              <input
                type="text"
                value={editFormData.course}
                onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:text-white"
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
      </Modal>

      {/* Modal: View Details */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Intern Profile Dossier">
        {selectedIntern && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#172236] border border-slate-700/60 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">{selectedIntern.name}</h4>
                <p className="text-xs text-slate-400">{selectedIntern.email} • {selectedIntern.phone || 'No phone'}</p>
                <p className="text-xs text-purple-300 mt-1">{selectedIntern.college} — {selectedIntern.course}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedIntern.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedIntern.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold">Attendance</p>
                <p className="text-xl font-bold text-blue-400 mt-1">{selectedIntern.attendanceScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold">Tasks</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">{selectedIntern.taskScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold">Composite</p>
                <p className="text-xl font-bold text-purple-400 mt-1">{selectedIntern.overallScore} / 100</p>
              </div>
            </div>

            {selectedIntern.stats && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Total Working Days Logged:</span>
                  <span className="font-bold text-white">{selectedIntern.stats.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Milestones:</span>
                  <span className="font-bold text-emerald-400">{selectedIntern.stats.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending / Active Tasks:</span>
                  <span className="font-bold text-amber-400">{selectedIntern.stats.totalTasks - selectedIntern.stats.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Progress Reports Filed:</span>
                  <span className="font-bold text-purple-300">{selectedIntern.stats.reportsCount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
