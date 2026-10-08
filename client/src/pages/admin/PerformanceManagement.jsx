import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { TrendingUp, Award, CalendarCheck, CheckSquare, FileText, Eye, Info, Trophy } from 'lucide-react';

export default function PerformanceManagement() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchPerformance = async () => {
    try {
      const res = await api.get('/performance');
      setRanking(res.data || []);
    } catch (err) {
      setError('Failed to fetch performance leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const getTier = (score) => {
    if (score >= 90) return { label: 'Top Performer', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
    if (score >= 75) return { label: 'High Achiever', badge: 'bg-purple-950 text-purple-300 border-purple-800' };
    if (score >= 60) return { label: 'Good Standing', badge: 'bg-blue-950 text-blue-300 border-blue-800' };
    return { label: 'Needs Focus', badge: 'bg-amber-950 text-amber-300 border-amber-800' };
  };

  const openDetails = (intern) => {
    setSelectedIntern(intern);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Performance Analytics & Leaderboard 🎯
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic cohort evaluation index ranking interns across verified attendance, task milestones and daily reports
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Cohort Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-[#131b2e] border border-purple-600/30 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Cohort Average</span>
            <Trophy size={18} className="text-amber-400" />
          </div>
          <p className="text-4xl font-black text-white mt-2">
            {ranking.length > 0 
              ? Math.round(ranking.reduce((acc, curr) => acc + curr.overallScore, 0) / ranking.length) 
              : 0}
            <span className="text-sm font-semibold text-slate-400"> / 100</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">Dynamic weighted composite score</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Attendance Index</span>
            <CalendarCheck size={18} className="text-blue-400" />
          </div>
          <p className="text-4xl font-black text-white mt-2">
            {ranking.length > 0 
              ? Math.round(ranking.reduce((acc, curr) => acc + curr.attendanceScore, 0) / ranking.length) 
              : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-2">Weighted at 35% in final grade</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Milestones Velocity</span>
            <CheckSquare size={18} className="text-emerald-400" />
          </div>
          <p className="text-4xl font-black text-white mt-2">
            {ranking.length > 0 
              ? Math.round(ranking.reduce((acc, curr) => acc + curr.taskScore, 0) / ranking.length) 
              : 0}%
          </p>
          <p className="text-xs text-slate-400 mt-2">Weighted at 40% in final grade</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-[#111827] border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Intern Ranking Leaderboard</h2>
          <span className="text-xs text-slate-400">Sorted by Overall Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#172236] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4 text-center">Rank</th>
                <th className="px-5 py-4">Intern Name</th>
                <th className="px-5 py-4">College</th>
                <th className="px-5 py-4 text-center">Attendance (35%)</th>
                <th className="px-5 py-4 text-center">Tasks (40%)</th>
                <th className="px-5 py-4 text-center">Reports (25%)</th>
                <th className="px-5 py-4 text-center">Overall Score</th>
                <th className="px-5 py-4 text-center">Tier</th>
                <th className="px-5 py-4 text-right">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center text-slate-400">Loading performance data...</td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-8 text-center text-slate-500">No interns found.</td>
                </tr>
              ) : (
                ranking.map((intern, idx) => {
                  const tier = getTier(intern.overallScore);
                  return (
                    <tr key={intern.internId} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-center font-black">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-black font-extrabold text-xs shadow">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-extrabold text-xs shadow">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">{idx + 1}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-white">{intern.name}</p>
                        <p className="text-xs text-slate-400">{intern.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-xs font-medium">
                        {intern.college}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-blue-400">
                        {intern.attendanceScore}%
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-emerald-400">
                        {intern.taskScore}%
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-purple-300">
                        {intern.reportScore}%
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-3 py-1.5 rounded-xl text-sm font-black bg-purple-950 text-purple-300 border border-purple-800">
                          {intern.overallScore} / 100
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${tier.badge}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openDetails(intern)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-300 transition"
                          title="View Metric Breakdown"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Transparency Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Info size={18} className="text-purple-400" /> Automated Grading Engine Standard
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The TalentBridge platform calculates performance algorithmically: 35% attendance compliance, 40% completed milestone deliverables, and 25% daily progress report consistency. No score is hard-coded or manually assigned.
        </p>
      </div>

      {/* Modal: Intern Performance Detail Breakdown */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Intern Performance Detail Card">
        {selectedIntern && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-[#172236] border border-slate-700/60">
              <h4 className="text-lg font-bold text-white">{selectedIntern.name}</h4>
              <p className="text-xs text-slate-400">{selectedIntern.college} • {selectedIntern.course}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Attendance (35%)</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{selectedIntern.attendanceScore}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Tasks (40%)</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{selectedIntern.taskScore}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Reports (25%)</p>
                <p className="text-2xl font-bold text-purple-300 mt-1">{selectedIntern.reportScore}%</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800 text-center">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">
                Composite Score
              </span>
              <span className="text-4xl font-black text-white mt-1 block">
                {selectedIntern.overallScore} / 100
              </span>
            </div>

            {selectedIntern.stats && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Present Days:</span>
                  <span className="font-bold text-emerald-400">{selectedIntern.stats.presentCount} / {selectedIntern.stats.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Tasks:</span>
                  <span className="font-bold text-white">{selectedIntern.stats.completedTasks} / {selectedIntern.stats.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Reports Filed:</span>
                  <span className="font-bold text-white">{selectedIntern.stats.reportsCount}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
