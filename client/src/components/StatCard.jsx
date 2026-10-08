import React from 'react';

export default function StatCard({ title, value, subtitle, color = 'blue', icon: Icon, onClick }) {
  // Pre-configured color themes exactly matching the user's uploaded screenshots
  const colorStyles = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    dark: 'bg-[#131b2e] border border-slate-800 text-white',
    amber: 'bg-amber-600 text-white',
    rose: 'bg-rose-600 text-white'
  };

  const selectedStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 transition transform hover:-translate-y-0.5 shadow-lg flex flex-col justify-between ${selectedStyle} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-bold tracking-tight opacity-95">{title}</h3>
        {Icon && <Icon size={24} className="opacity-80" />}
      </div>
      <div className="mt-2">
        <span className="text-4xl sm:text-5xl font-black tracking-tight">{value}</span>
      </div>
      {subtitle && (
        <p className="mt-2 text-xs sm:text-sm opacity-85">{subtitle}</p>
      )}
    </div>
  );
}
