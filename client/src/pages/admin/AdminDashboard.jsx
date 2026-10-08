import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import {
  Users,
  UserCheck,
  CheckSquare,
  Clock,
  FileText,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch administrator statistics.');
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalInterns: 0,
    activeInterns: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalReportsSubmitted: 0,
    averageAttendance: 0
  };

  const charts = data?.charts || {
    attendanceBreakdown: { present: 0, late: 0, absent: 0 },
    taskBreakdown: { completed: 0, pending: 0, submitted: 0 }
  };

  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Administrator Dashboard 📊
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Workforce tracking metrics, intern cohort oversight, and operational status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/interns"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Add Intern
          </Link>
          <Link
            to="/admin/tasks"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Create Task
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* 6 Key Administrator Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Users size={14} className="text-purple-400" /> Total Interns
          </p>
          <p className="text-3xl font-extrabold text-white mt-2">{stats.totalInterns}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <UserCheck size={14} /> Active
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.activeInterns}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock size={14} /> Pending Tasks
          </p>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">{stats.pendingTasks}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <CheckSquare size={14} /> Completed
          </p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.completedTasks}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 text-center">
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <FileText size={14} /> Reports
          </p>
          <p className="text-3xl font-extrabold text-purple-300 mt-2">{stats.totalReportsSubmitted}</p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-600 text-white text-center shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wider opacity-90">Avg Attendance</p>
          <p className="text-3xl font-black mt-2">{stats.averageAttendance}%</p>
        </div>
      </div>

      {/* Charts & Visual Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown Bar Graph */}
        <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck size={18} className="text-blue-400" /> Attendance Distribution
            </h3>
            <span className="text-xs text-slate-400">All Registered Records</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-bold">Present Check-ins</span>
                <span className="text-white font-bold">{charts.attendanceBreakdown.present}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (charts.attendanceBreakdown.present / Math.max(1, charts.attendanceBreakdown.present + charts.attendanceBreakdown.late + charts.attendanceBreakdown.absent)) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold">Late Arrivals</span>
                <span className="text-white font-bold">{charts.attendanceBreakdown.late}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (charts.attendanceBreakdown.late / Math.max(1, charts.attendanceBreakdown.present + charts.attendanceBreakdown.late + charts.attendanceBreakdown.absent)) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-bold">Absences</span>
                <span className="text-white font-bold">{charts.attendanceBreakdown.absent}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (charts.attendanceBreakdown.absent / Math.max(1, charts.attendanceBreakdown.present + charts.attendanceBreakdown.late + charts.attendanceBreakdown.absent)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Velocity Breakdown */}
        <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare size={18} className="text-purple-400" /> Milestone Deliverables Status
            </h3>
            <span className="text-xs text-slate-400">Total {stats.totalTasks} Tasks</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-bold">Completed & Approved</span>
                <span className="text-white font-bold">{charts.taskBreakdown.completed}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (charts.taskBreakdown.completed / Math.max(1, stats.totalTasks)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-bold">Submitted (Awaiting Review)</span>
                <span className="text-white font-bold">{charts.taskBreakdown.submitted}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (charts.taskBreakdown.submitted / Math.max(1, stats.totalTasks)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold">Pending / In Progress</span>
                <span className="text-white font-bold">{charts.taskBreakdown.pending}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (charts.taskBreakdown.pending / Math.max(1, stats.totalTasks)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Activity Feed */}
      <div className="rounded-2xl p-6 bg-[#111827] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Recent System Activity ⚡
          </h3>
          <Link to="/admin/reports" className="text-xs font-semibold text-purple-400 hover:text-purple-300">
            View All Reports →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No recent activities logged in system.</p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentActivities.map((act, index) => (
              <div key={index} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <div>
                    <p className="font-semibold text-white">{act.title}</p>
                    <p className="text-xs text-slate-400">{act.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
