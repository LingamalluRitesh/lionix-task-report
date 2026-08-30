import React from 'react';
import { Shield, User, LogOut, Sparkles, Crown, Users, Clock } from 'lucide-react';

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
          {/* Brand Logo (No plain LionIX text name in nav bar for all dashboards) */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="LionIX"
              className="h-10 w-auto object-contain shrink-0 select-none cursor-pointer drop-shadow-2xs"
            />
            <div className="flex items-center gap-2">
              {isAdminMode ? (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-mono">
                  🛡️ Admin
                </span>
              ) : isLead ? (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 font-mono shadow-2xs">
                  {isCoordinator ? '⚡ Coordinator' : '👑 Team Lead'}
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono shadow-2xs">
                  Work Tracker
                </span>
              )}
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
