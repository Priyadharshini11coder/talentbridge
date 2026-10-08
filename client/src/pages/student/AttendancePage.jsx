import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CalendarCheck, Clock, CheckCircle2, AlertTriangle, XCircle, LogIn, LogOut } from 'lucide-react';

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data.records || []);
      setStats(res.data.stats || {
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 100
      });
    } catch (err) {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleSelfAction = async (action) => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/attendance/self-action', { action });
      setMessage(res.data.message);
      await fetchAttendance();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to perform ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Attendance Tracking 📅
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Log your daily workstation presence and review attendance history
          </p>
        </div>

        {/* Quick Check In / Check Out Card */}
        <div className="flex items-center gap-2 bg-[#131b2e] p-2 rounded-2xl border border-slate-800">
          {!todayRecord ? (
            <button
              onClick={() => handleSelfAction('check-in')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 disabled:opacity-50"
            >
              <LogIn size={16} /> Check In Today
            </button>
          ) : todayRecord.checkOut === '--' ? (
            <button
              onClick={() => handleSelfAction('check-out')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition active:scale-95 disabled:opacity-50"
            >
              <LogOut size={16} /> Check Out for the Day
            </button>
          ) : (
            <div className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 rounded-xl border border-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} /> Checked Out ({todayRecord.checkOut})
            </div>
          )}
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

      {/* 5 Attendance Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Days</p>
          <p className="text-3xl font-extrabold text-white mt-1.5">{stats?.totalDays || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckCircle2 size={13} /> Present
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1.5">{stats?.present || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <AlertTriangle size={13} /> Late
          </p>
          <p className="text-3xl font-extrabold text-amber-400 mt-1.5">{stats?.late || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <XCircle size={13} /> Absent
          </p>
          <p className="text-3xl font-extrabold text-rose-400 mt-1.5">{stats?.absent || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-600 text-white text-center shadow-lg col-span-2 sm:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Attendance %</p>
          <p className="text-3xl font-black mt-1.5">{stats?.percentage || 0}%</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Attendance Log History</h2>
          <span className="text-xs text-slate-400">Total {records.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#172236] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Notes / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No attendance records found. Click "Check In Today" to log your first record!
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                      {r.checkIn || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                      {r.checkOut || '--'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
