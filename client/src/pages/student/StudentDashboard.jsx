import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  Award,
  ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-9 h-9 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    attendancePercentage: 0,
    attendanceRecordsCount: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    submittedTasks: 0,
    reportsSubmitted: 0,
    performanceScore: 0
  };

  const todayTasks = data?.todayTasks || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome Back 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Manage your internship activities from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/tasks"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm flex items-center gap-1.5"
          >
            Submit Work 📝
          </Link>
          <Link
            to="/student/attendance"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm flex items-center gap-1.5"
          >
            Check In 📅
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 3 Signature Primary Stat Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance (Blue) */}
        <StatCard
          title="Attendance"
          value={`${stats.attendancePercentage}%`}
          subtitle={`${stats.attendanceRecordsCount} total working day records`}
          color="blue"
          icon={CalendarCheck}
        />

        {/* Tasks Submitted (Green) */}
        <StatCard
          title="Tasks Submitted"
          value={stats.submittedTasks + stats.completedTasks}
          subtitle={`${stats.completedTasks} approved • ${stats.pendingTasks} pending`}
          color="green"
          icon={CheckSquare}
        />

        {/* Performance Score (Purple) */}
        <StatCard
          title="Performance Score"
          value={stats.performanceScore}
          subtitle="Dynamic score (Attendance + Tasks + Reports)"
          color="purple"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Updates Card matching Screenshot 3 */}
      <div className="rounded-2xl p-6 sm:p-7 bg-[#131b2e] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Recent Updates</h2>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
            <span className="text-emerald-400">✅</span>
            <span>Total Attendance Records: <strong className="text-white">{stats.attendanceRecordsCount}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
            <span className="text-amber-400">📋</span>
            <span>Total Tasks Submitted: <strong className="text-white">{stats.submittedTasks + stats.completedTasks}</strong></span>
          </div>

          <div className="flex items-center gap-3 text-slate-200 text-sm font-medium">
            <span className="text-purple-400">🎯</span>
            <span>Performance Score: <strong className="text-purple-300">{stats.performanceScore} / 100</strong></span>
          </div>
        </div>
      </div>

      {/* Internship Progress Bar */}
      <div className="rounded-2xl p-6 sm:p-7 bg-[#111827] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-white">Internship Milestone Progress</span>
          <span className="font-bold text-purple-400">{data?.progressPercentage || 0}% Complete</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, data?.progressPercentage || 0)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{stats.completedTasks} of {stats.totalTasks} milestones completed</span>
          <span>{stats.reportsSubmitted} daily reports filed</span>
        </div>
      </div>

      {/* 2 Column: Today's Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Today's Tasks 📌
              </h3>
              <Link to="/student/tasks" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {todayTasks.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No pending tasks for today.</p>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((t) => (
                  <div
                    key={t.id || t._id}
                    className="p-3.5 rounded-xl bg-[#172236] border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{t.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Clock size={12} /> Due: {t.dueDate}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'High' ? 'bg-red-950 text-red-300 border border-red-800' :
                          t.priority === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        t.status === 'Submitted' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        t.status === 'In Progress' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-2">
            <Link
              to="/student/tasks"
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-[#1c2638] hover:bg-slate-700 text-purple-300 block transition"
            >
              Go to Task Submission Workspace →
            </Link>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Recent Activity ⚡
            </h3>
            <span className="text-xs text-slate-500">Live Timeline</span>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No recent activity logged yet.</p>
          ) : (
            <div className="space-y-3.5">
              {recentActivities.map((act, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-600/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                    {act.type === 'attendance' ? <CalendarCheck size={16} /> :
                     act.type === 'submission' ? <CheckSquare size={16} /> :
                     <FileText size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{act.title}</p>
                    <p className="text-xs text-slate-400 truncate">{act.subtitle}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">{act.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
