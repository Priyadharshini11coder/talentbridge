import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loggedUser = await login(email, password, role);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#080c16] flex flex-col justify-between items-center px-4 py-8 text-slate-100">
      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <Link to="/" className="text-2xl font-bold tracking-tight text-purple-400">
          TalentBridge
        </Link>
        <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
          ← Back to Home
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            Sign In to Workspace 🔑
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Access your internship tracking portal
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              role === 'student'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User size={15} /> Student / Intern
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition ${
              role === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={15} /> Administrator
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500" size={17} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500" size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#1c2638] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2 active:scale-98"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In as {role === 'admin' ? 'Admin' : 'Student'} <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Autofill Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
            Quick Demo Autofill Credentials
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('priya@example.com', 'password123', 'student')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-purple-300 border border-slate-700 transition"
            >
              Priya (Intern)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('meena@example.com', 'password123', 'student')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-emerald-300 border border-slate-700 transition"
            >
              Meena (Intern)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@talentbridge.com', 'admin123', 'admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 border border-slate-700 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          New intern without an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-bold underline">
            Sign up here
          </Link>
        </p>
      </div>

      <div className="text-center text-xs text-slate-500 mt-6">
        TalentBridge Security • Encrypted Sessions • 256-bit JWT
      </div>
    </div>
  );
}
