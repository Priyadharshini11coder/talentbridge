import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { TrendingUp, Award, CalendarCheck, CheckSquare, FileText, CheckCircle2, Info } from 'lucide-react';

export default function PerformancePage() {
  const { user } = useAuth();
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPerformance() {
      if (!user) return;
      try {
        const res = await api.get(`/performance/${user.id}`);
        setPerfData(res.data);
      } catch (err) {
        setError('Failed to calculate dynamic performance score.');
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const attendanceScore = perfData?.attendanceScore || 0;
  const taskScore = perfData?.taskScore || 0;
  const reportScore = perfData?.reportScore || 0;
  const overallScore = perfData?.overallScore || 0;

  const getTier = (score) => {
    if (score >= 90) return { title: 'Exceptional Distinction', color: 'text-emerald-400', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
    if (score >= 75) return { title: 'High Achiever', color: 'text-purple-400', badge: 'bg-purple-950 text-purple-300 border-purple-800' };
    if (score >= 60) return { title: 'Good Standing', color: 'text-blue-400', badge: 'bg-blue-950 text-blue-300 border-blue-800' };
    return { title: 'Needs Accelerated Focus', color: 'text-amber-400', badge: 'bg-amber-950 text-amber-300 border-amber-800' };
  };

  const tier = getTier(overallScore);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Performance Analytics 🎯
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Dynamic evaluation index computed across attendance, task deliverables, and reports
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Main Overall Score Card */}
      <div className="rounded-3xl p-8 bg-gradient-to-br from-purple-900/60 via-[#131b2e] to-[#0d1424] border border-purple-600/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-slate-700 bg-slate-900/80">
            <Award size={14} className="text-purple-400" /> Dynamic Workforce Metric
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Overall Score: <span className="text-purple-300">{overallScore} / 100</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed">
            Status Tier:{' '}
            <span className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs ${tier.badge}`}>
              {tier.title}
            </span>
          </p>
        </div>

        {/* Circular Gauge Representation */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-8 border-slate-800" />
          <div
            className="absolute inset-0 rounded-full border-8 border-purple-500 border-t-transparent animate-spin-slow"
            style={{ transform: `rotate(${(overallScore / 100) * 360}deg)` }}
          />
          <div className="text-center z-10">
            <span className="text-4xl font-black text-white">{overallScore}%</span>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Composite</span>
          </div>
        </div>
      </div>

      {/* Breakdown Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance (35% Weight) */}
        <div className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
              <CalendarCheck size={20} /> Attendance
            </div>
            <span className="text-xs font-bold text-slate-400">35% Weight</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300 font-medium">Compliance Rate</span>
              <span className="font-bold text-blue-300">{attendanceScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${attendanceScore}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Calculated from verified check-ins and working day logs. On-time check-in maintains a perfect score.
          </p>
        </div>

        {/* Task Completion (40% Weight) */}
        <div className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <CheckSquare size={20} /> Tasks
            </div>
            <span className="text-xs font-bold text-slate-400">40% Weight</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300 font-medium">Deliverables Completion</span>
              <span className="font-bold text-emerald-300">{taskScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${taskScore}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Calculated from completed tasks, review approvals, and timely milestone submissions.
          </p>
        </div>

        {/* Daily Reports (25% Weight) */}
        <div className="rounded-2xl p-6 bg-[#131b2e] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
              <FileText size={20} /> Reports
            </div>
            <span className="text-xs font-bold text-slate-400">25% Weight</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-300 font-medium">Daily Report Velocity</span>
              <span className="font-bold text-purple-300">{reportScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${reportScore}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Evaluated on consistency of daily progress reports filed per active working day.
          </p>
        </div>
      </div>

      {/* Dynamic Calculation Formula Transparency Card */}
      <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Info size={18} className="text-purple-400" /> Dynamic Scoring Algorithm Breakdown
        </h3>
        <div className="p-4 rounded-xl bg-[#172236] border border-slate-700/60 font-mono text-xs text-purple-200">
          Overall Score = (Attendance Score × 0.35) + (Task Score × 0.40) + (Report Score × 0.25)
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Scores update dynamically in real time upon every task review, attendance check, and daily report submission without manual data entry.
        </p>
      </div>
    </div>
  );
}
