import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { FileText, Calendar, User, Lightbulb, AlertCircle, Compass, Search } from 'lucide-react';

export default function ReportManagement() {
  const [reports, setReports] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedIntern, setSelectedIntern] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [repRes, intRes] = await Promise.all([
        api.get('/reports', {
          params: {
            internId: selectedIntern !== 'all' ? selectedIntern : undefined,
            date: selectedDate || undefined
          }
        }),
        api.get('/interns')
      ]);
      setReports(repRes.data || []);
      setInterns(intRes.data || []);
    } catch (err) {
      setError('Failed to fetch daily reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedIntern, selectedDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Daily Progress Reports Review 📑
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor daily logs, technical competencies, challenges and next day plans across all interns
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Intern
            </label>
            <select
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="mt-5 text-xs text-slate-400 hover:text-white underline"
            >
              Reset Date
            </button>
          )}
        </div>

        <span className="text-xs text-slate-400 self-end sm:self-center">
          {reports.length} reports logged
        </span>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl p-8 bg-[#111827] border border-slate-800 text-center text-slate-400">
            Loading reports feed...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl p-8 bg-[#111827] border border-slate-800 text-center text-slate-400">
            No daily reports found matching filter.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id || report._id}
              className="rounded-2xl p-6 sm:p-7 bg-[#111827] border border-slate-800 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300">
                    {report.internName ? report.internName[0].toUpperCase() : 'I'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{report.internName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar size={13} className="text-purple-400" /> Report Date: {report.date}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500">
                  Logged on {new Date(report.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Work Completed
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-[#172236] p-4 rounded-xl border border-slate-700/60">
                  {report.workCompleted}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {report.skillsLearned && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1 flex items-center gap-1">
                      <Lightbulb size={13} /> Skills Acquired:
                    </span>
                    <span className="text-slate-300 leading-relaxed">{report.skillsLearned}</span>
                  </div>
                )}

                {report.challenges && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-rose-300 block mb-1 flex items-center gap-1">
                      <AlertCircle size={13} /> Roadblocks & Challenges:
                    </span>
                    <span className="text-slate-300 leading-relaxed">{report.challenges}</span>
                  </div>
                )}

                {report.tomorrowPlan && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-blue-300 block mb-1 flex items-center gap-1">
                      <Compass size={13} /> Next Day Objectives:
                    </span>
                    <span className="text-slate-300 leading-relaxed">{report.tomorrowPlan}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
