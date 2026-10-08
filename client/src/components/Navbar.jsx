import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Shield, User, LogOut } from 'lucide-react';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPublicPage = ['/', '/login', '/signup'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/95 backdrop-blur border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle for authenticated pages */}
        {isAuthenticated && !isPublicPage && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        {/* Brand Logo matching Screenshots */}
        <Link to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/student/dashboard') : '/'} className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-400 hover:text-purple-300 transition">
            TalentBridge
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!isAuthenticated ? (
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
        ) : (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role indicator badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              {isAdmin ? (
                <>
                  <Shield size={14} className="text-amber-400" />
                  <span className="font-semibold text-amber-300">Admin</span>
                </>
              ) : (
                <>
                  <User size={14} className="text-blue-400" />
                  <span className="font-semibold text-blue-300">Intern</span>
                </>
              )}
              <span className="text-slate-400">|</span>
              <span className="text-slate-200 font-medium truncate max-w-[140px]">{user?.name}</span>
            </div>

            {/* Logout Button matching Screenshot 3 Red Style */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition shadow-sm active:scale-95"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
