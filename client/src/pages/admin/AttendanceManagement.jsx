import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { CalendarCheck, Search, Filter, Plus, Edit2, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function AttendanceManagement() {
  const [records, setRecords] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedIntern, setSelectedIntern] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals & Forms
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [markForm, setMarkForm] = useState({
    internId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    notes: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchInterns = async () => {
    try {
      const res = await api.get('/interns');
      setInterns(res.data || []);
      if (res.data?.length > 0 && !markForm.internId) {
        setMarkForm(prev => ({ ...prev, internId: res.data[0].id || res.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance', {
        params: {
          internId: selectedIntern !== 'all' ? selectedIntern : undefined,
          date: selectedDate || undefined
        }
      });
      setRecords(res.data.records || []);
    } catch (err) {
      setError('Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedIntern, selectedDate]);

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!markForm.internId) {
      setError('Please select an intern.');
      return;
    }

    try {
      await api.post('/attendance', markForm);
      setMessage('Attendance successfully logged!');
      setIsMarkOpen(false);
      await fetchAttendance();
    } catch (err) {
      setError('Failed to record attendance.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await api.put(`/attendance/${selectedRecord.id || selectedRecord._id}`, selectedRecord);
      setMessage('Attendance record updated!');
      setIsEditOpen(false);
      await fetchAttendance();
    } catch (err) {
      setError('Failed to update attendance.');
    }
  };

  const openEdit = (record) => {
    setSelectedRecord({ ...record });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Attendance Management 📅
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit presence records, verify timestamps, and mark attendance status for interns
          </p>
        </div>

        <button
          onClick={() => setIsMarkOpen(true)}
          className="px-4 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/30 flex items-center gap-2 text-sm self-start sm:self-auto active:scale-95"
        >
          <Plus size={17} /> Mark Intern Attendance
        </button>
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

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter Intern</label>
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Interns ({interns.length})</option>
              {interns.map((i) => (
                <option key={i.id || i._id} value={i.id || i._id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Filter Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="mt-5 text-xs text-slate-400 hover:text-white underline"
            >
              Clear Date
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-center">
          Showing {records.length} records
        </span>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#172236] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Intern Name</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Check In</th>
                <th className="px-5 py-4">Check Out</th>
                <th className="px-5 py-4">Notes</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">Loading attendance records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No attendance records found for criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-semibold text-white whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-4 font-bold text-purple-300 whitespace-nowrap">{r.internName}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                        r.status === 'Present' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        r.status === 'Late' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-red-950 text-red-300 border border-red-800'
                      }`}>
                        {r.status === 'Present' && <CheckCircle2 size={13} />}
                        {r.status === 'Late' && <AlertTriangle size={13} />}
                        {r.status === 'Absent' && <XCircle size={13} />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{r.checkIn || '--'}</td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{r.checkOut || '--'}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs">{r.notes || '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Edit Record"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Mark Attendance */}
      <Modal isOpen={isMarkOpen} onClose={() => setIsMarkOpen(false)} title="Record Intern Attendance">
        <form onSubmit={handleMarkSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Intern *</label>
            <select
              required
              value={markForm.internId}
              onChange={(e) => setMarkForm({ ...markForm, internId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={markForm.date}
                onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status *</label>
              <select
                value={markForm.status}
                onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Check In Time</label>
              <input
                type="text"
                value={markForm.checkIn}
                onChange={(e) => setMarkForm({ ...markForm, checkIn: e.target.value })}
                placeholder="09:00 AM"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Check Out Time</label>
              <input
                type="text"
                value={markForm.checkOut}
                onChange={(e) => setMarkForm({ ...markForm, checkOut: e.target.value })}
                placeholder="05:00 PM"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Remarks / Reason</label>
            <input
              type="text"
              value={markForm.notes}
              onChange={(e) => setMarkForm({ ...markForm, notes: e.target.value })}
              placeholder="e.g. Approved leave or on-site client visit"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMarkOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
            >
              Record Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Attendance Record */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Attendance Log">
        {selectedRecord && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedRecord.date}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={selectedRecord.status}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check In</label>
                <input
                  type="text"
                  value={selectedRecord.checkIn || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, checkIn: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Check Out</label>
                <input
                  type="text"
                  value={selectedRecord.checkOut || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, checkOut: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                value={selectedRecord.notes || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700 text-white text-sm"
              />
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
                className="px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              >
                Save Updates
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
