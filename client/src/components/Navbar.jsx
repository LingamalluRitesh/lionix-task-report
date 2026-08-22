import React from 'react';
import { Activity, Shield, User, LogOut, Flame, Sparkles, Crown, Users, Clock } from 'lucide-react';

export const Navbar = ({
  isAdminMode,
  adminUser,
  employeeUser,
  currentAdminTab,
  onAdminTabChange,
  leadTab,
  onLeadTabChange,
  onLogout
}) => {
  const isLead = Boolean(employeeUser?.isLead);
  const isCoordinator = (employeeUser?.role || '').toLowerCase().includes('coordinator');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl p-0.5 shadow-md flex items-center justify-center text-white font-extrabold ${
              isAdminMode
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
                : isLead
                ? 'bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/25'
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/25'
            }`}>
              {isAdminMode ? (
                <Shield className="w-5 h-5" />
              ) : isLead ? (
                isCoordinator ? <Sparkles className="w-5 h-5" /> : <Crown className="w-5 h-5" />
              ) : (
                <Flame className="w-5 h-5 fill-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                  LionIX
                </span>
                <span className="font-bold text-sm text-amber-600 uppercase tracking-wide">
                  Task Report
                </span>
                {isAdminMode ? (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Admin
                  </span>
                ) : isLead ? (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 font-mono">
                    {isCoordinator ? '⚡ Coordinator' : '👑 Team Lead'}
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    9 AM - 6 PM
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isAdminMode 
                  ? 'Executive Performance Reports & System Administration' 
                  : isLead
                  ? 'Team Workprogress Monitor & View-Only Reports'
                  : 'Daily & Hourly Work Tracker'}
              </p>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          {isAdminMode && adminUser && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => onAdminTabChange('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAdminTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onAdminTabChange('hourly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAdminTab === 'hourly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hourly Work Report
              </button>
              <button
                onClick={() => onAdminTabChange('daily')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAdminTab === 'daily'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Work Report
              </button>
              <button
                onClick={() => onAdminTabChange('members')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAdminTab === 'members'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team &amp; Leads
              </button>
              <button
                onClick={() => onAdminTabChange('projects')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentAdminTab === 'projects'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Projects
              </button>
            </div>
          )}

          {/* Team Lead Navigation Tabs */}
          {!isAdminMode && isLead && employeeUser && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => onLeadTabChange('team-progress')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  leadTab === 'team-progress'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Progress (View-Only)</span>
              </button>
              <button
                onClick={() => onLeadTabChange('my-tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  leadTab === 'my-tasks'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>My Hourly Logger</span>
              </button>
            </div>
          )}

          {/* Right Section / User & Signout */}
          <div className="flex items-center gap-3">
            {/* Employee or Lead logged in */}
            {!isAdminMode && employeeUser && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 pr-2 py-1 bg-slate-100 border border-slate-200 rounded-full">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: employeeUser.avatarColor || '#0284c7' }}
                  >
                    {employeeUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                      {employeeUser.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}

            {/* Admin logged in */}
            {isAdminMode && adminUser && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 pr-2 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                    A
                  </div>
                  <span className="text-xs font-bold text-indigo-950 hidden sm:inline">
                    {adminUser.name}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  title="Exit Admin Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
