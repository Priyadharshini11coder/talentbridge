import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  CheckSquare,
  TrendingUp,
  Building2,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const { quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (type) => {
    try {
      const user = await quickLogin(type);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Top Navbar matching Screenshot 2 */}
      <header className="w-full border-b border-slate-800/80 px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-400">
          TalentBridge
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-white transition shadow-sm"
          >
            Signup
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col items-center text-center">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
            TalentBridge
          </h1>
          <h2 className="text-xl sm:text-2xl font-medium text-slate-300">
            Internship & Workforce Tracking Platform
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed pt-2">
            Manage attendance, daily tasks, internship progress, reports and performance tracking through one centralized platform.
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
            <Link
              to="/signup"
              className="px-7 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/30 flex items-center gap-2 active:scale-95"
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3 rounded-xl font-bold bg-[#1e293b] hover:bg-slate-700 text-white transition border border-slate-700 active:scale-95"
            >
              Login
            </Link>
          </div>
        </div>

        {/* 1-Click Demo Evaluation Launcher */}
        <div className="w-full max-w-3xl mt-12 p-4 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-3">
            <Zap size={14} /> Quick Demo Access (1-Click Login)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickDemo('priya')}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-purple-900/50 border border-slate-700 hover:border-purple-500 text-left transition group"
            >
              <div className="font-bold text-sm text-white group-hover:text-purple-300">👩 Priyadharshini</div>
              <div className="text-xs text-slate-400">Intern (Active Projects)</div>
            </button>
            <button
              onClick={() => handleQuickDemo('meena')}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-900/50 border border-slate-700 hover:border-emerald-500 text-left transition group"
            >
              <div className="font-bold text-sm text-white group-hover:text-emerald-300">👩 Meenarevathi</div>
              <div className="text-xs text-slate-400">Intern (CIT Tech)</div>
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-amber-900/50 border border-slate-700 hover:border-amber-500 text-left transition group"
            >
              <div className="font-bold text-sm text-white group-hover:text-amber-300">🛡️ Program Director</div>
              <div className="text-xs text-slate-400">Admin Console</div>
            </button>
          </div>
        </div>

        {/* 3 Signature Feature Cards matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-14 text-left">
          {/* Card 1: Attendance (Blue) */}
          <div className="rounded-2xl p-7 bg-blue-600 text-white shadow-xl transform transition hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <CalendarCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Mark and track intern attendance easily. Real-time check-in, check-out timestamps, working hours, and automated percentage statistics.
            </p>
          </div>

          {/* Card 2: Task Management (Green) */}
          <div className="rounded-2xl p-7 bg-emerald-600 text-white shadow-xl transform transition hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Task Management</h3>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Submit and monitor daily internship tasks. Assign prioritized milestones, review deliverables with GitHub links, and track progress.
            </p>
          </div>

          {/* Card 3: Analytics (Purple) */}
          <div className="rounded-2xl p-7 bg-purple-600 text-white shadow-xl transform transition hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-purple-100 text-sm leading-relaxed">
              View performance and internship statistics. Dynamically weighted scoring across attendance, task completion, and daily reports.
            </p>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="mt-20 w-full pt-12 border-t border-slate-800">
          <h3 className="text-2xl font-bold text-white mb-2">Built for Modern Workforce Development</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10">
            Engineered to replace manual spreadsheets with an automated, auditable tracking ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
              <Building2 className="text-purple-400 mb-3" size={28} />
              <h4 className="font-bold text-white text-base mb-1">Startups</h4>
              <p className="text-slate-400 text-sm">
                Scale your internship programs smoothly with zero administrative overhead and automated reporting.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
              <Briefcase className="text-emerald-400 mb-3" size={28} />
              <h4 className="font-bold text-white text-base mb-1">Internship Providers</h4>
              <p className="text-slate-400 text-sm">
                Supervise cohorts of students, evaluate daily progress reports, and issue performance certificates.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800">
              <GraduationCap className="text-blue-400 mb-3" size={28} />
              <h4 className="font-bold text-white text-base mb-1">Training Institutes</h4>
              <p className="text-slate-400 text-sm">
                Track curriculum progression, skill development velocity, and student deliverables in real-time.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 px-6 sm:px-12 py-8 bg-[#070a12] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span className="text-purple-400 font-bold">TalentBridge</span> © 2026. Internship & Workforce Tracking Platform.
        </div>
        <div className="flex items-center gap-6">
          <span>Enterprise MVP</span>
          <span>Role-Based Access Control</span>
          <span>MongoDB & Express REST API</span>
        </div>
      </footer>
    </div>
  );
}
