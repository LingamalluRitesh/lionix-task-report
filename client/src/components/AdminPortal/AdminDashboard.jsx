import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Briefcase, 
  Target, 
  Zap, 
  Award, 
  AlertCircle,
  FolderKanban,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Save,
  Check,
  Activity
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard = ({
  stats = {},
  selectedDate,
  currentShift = 'morning',
  onShiftChange,
  onDateChange,
  onNavigateTab,
  onUpdateDailyGoal,
  dailyTaskGoal = 100
}) => {
  const [goalInput, setGoalInput] = useState(dailyTaskGoal);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const [activeShift, setActiveShift] = useState(currentShift);

  useEffect(() => {
    setGoalInput(dailyTaskGoal);
  }, [dailyTaskGoal]);

  useEffect(() => {
    setActiveShift(currentShift);
  }, [currentShift]);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const parsed = parseInt(goalInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 2999) {
      alert('Please enter a valid daily target goal between 1 and 2,999 tasks.');
      return;
    }

    setIsSavingGoal(true);
    try {
      if (onUpdateDailyGoal) {
        await onUpdateDailyGoal(parsed);
        setGoalSaved(true);
        setTimeout(() => setGoalSaved(false), 2500);
      }
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleShiftSwitch = (shift) => {
    setActiveShift(shift);
    if (onShiftChange) {
      onShiftChange(shift);
    }
  };

  const isNightShift = activeShift === 'night';
  const totalTasks = Number(stats?.totalTasksToday) || 0;
  const activeMembers = Number(stats?.activeMembersToday) || 0;
  const totalMembers = Number(stats?.totalMembers) || 15;
  const hoursLogged = Number(stats?.hoursLoggedToday) || 0;
  const avgTasksPerHour = stats?.avgTasksPerHour || '0.0';
  const hourlyVelocity = Array.isArray(stats?.hourlyVelocity) ? stats.hourlyVelocity : [];
  const projectDistribution = Array.isArray(stats?.projectDistribution) ? stats.projectDistribution : [];
  const memberLeaderboard = Array.isArray(stats?.memberLeaderboard) ? stats.memberLeaderboard : [];
  const topProject = stats?.topProject || '';

  const currentGoalNum = Number(dailyTaskGoal) || 100;
  const totalTeamTargetGoal = totalMembers * currentGoalNum;
  const teamGoalCompletionPercent = totalTeamTargetGoal > 0 
    ? Math.min(100, Math.round((totalTasks / totalTeamTargetGoal) * 100))
    : 0;

  // Normalize Hourly Velocity data
  const normalizedVelocity = hourlyVelocity.map(item => ({
    hour: item.hour || item.hourSlot || '',
    tasks: Number(item.tasks) || 0,
    activeMembers: Number(item.activeMembers) || 0,
    inProgress: Number(item.inProgress) || 0
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner with Shift Selector & Date Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">LionIX Central Administration</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              Master Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workforce intelligence, project task goals, and velocity diagnostics across 15 employees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Shift Switcher Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleShiftSwitch('morning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                !isNightShift ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Morning (9AM-6PM)</span>
            </button>
            <button
              type="button"
              onClick={() => handleShiftSwitch('night')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isNightShift ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Night (8PM-5AM)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 shadow-xs">
            <Calendar className="w-4 h-4 text-amber-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer font-mono"
            />
          </div>
          <button
            onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Daily Task Goal Configuration Banner */}
      <div className={`rounded-3xl p-6 text-white shadow-lg transition-all ${
        isNightShift
          ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 shadow-indigo-500/20'
          : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-amber-500/20'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-200" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-100">
                Default Daily Task Goal &amp; Project Target Limits
              </span>
            </div>
            <h3 className="text-xl font-black">
              Standard Target Goal: {currentGoalNum} Tasks / Contributor
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Global target across the {isNightShift ? '8:00 PM – 5:00 AM Night Shift' : '9:00 AM – 6:00 PM Morning Shift'}. Individual project daily targets can also be customized separately in the Project Catalog.
            </p>
          </div>

          {/* Goal Editor Form & Project Link */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <form onSubmit={handleSaveGoal} className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <span className="text-xs font-bold text-white">Default Goal:</span>
                <input
                  type="number"
                  min="1"
                  max="2999"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="1-2999"
                  className="w-24 px-2.5 py-1 text-center bg-white text-slate-900 text-sm font-extrabold rounded-xl focus:ring-2 focus:ring-amber-300 focus:outline-none font-mono"
                />
                <span className="text-xs text-amber-100 font-bold">tasks</span>
              </div>
              <button
                type="submit"
                disabled={isSavingGoal}
                className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-amber-50 text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingGoal ? (
                  <span>Saving...</span>
                ) : goalSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Set Goal</span>
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => onNavigateTab('projects')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <FolderKanban className="w-4 h-4 text-amber-200" />
              <span>Project Goals</span>
            </button>
          </div>
        </div>

        {/* Live Goal Progress Tracking */}
        <div className="mt-5 pt-5 border-t border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-200" />
              <span>Total Team Target Delivery: {totalTasks} of {totalTeamTargetGoal} tasks ({totalMembers} team members)</span>
            </div>
            <span className="font-mono text-sm">{teamGoalCompletionPercent}% Achieved</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all duration-700 shadow-sm"
              style={{ width: `${teamGoalCompletionPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks Completed"
          value={totalTasks}
          subtitle={`Across ${hoursLogged} logged sessions on ${selectedDate}`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Contributors"
          value={`${activeMembers} / ${totalMembers}`}
          subtitle={`${Math.round((activeMembers / totalMembers) * 100)}% active participation today`}
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Total Hours Logged"
          value={`${hoursLogged} hrs`}
          subtitle={isNightShift ? '8:00 PM – 5:00 AM Night Shift' : '9:00 AM – 6:00 PM Morning Shift'}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Avg Production Velocity"
          value={`${avgTasksPerHour} / hr`}
          subtitle="Real-time completed tasks per working hour"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Charts Section: Hourly Velocity & Project Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Velocity Chart (Upgraded with In-Progress & Active Contributors) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Hourly Production Velocity &amp; Active Work Sessions</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays completed task throughput alongside active contributing workforce for every hour slot.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500"></span> Tasks Done
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-500"></span> Active Workers
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {normalizedVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={normalizedVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(val) => (typeof val === 'string' && val.includes(' - ') ? val.split(' - ')[0] : String(val || ''))}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(val, name) => [
                      name === 'tasks' ? `${val} tasks` : `${val} members`,
                      name === 'tasks' ? 'Completed Tasks' : 'Active Contributors'
                    ]}
                    labelFormatter={(label) => `Time Slot: ${label}`}
                  />
                  <Bar dataKey="tasks" fill={isNightShift ? '#6366f1' : '#f59e0b'} radius={[6, 6, 0, 0]} name="tasks" />
                  <Bar dataKey="activeMembers" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="activeMembers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No hourly task activity logged for {selectedDate}.
              </div>
            )}
          </div>
        </div>

        {/* Project Task Distribution with Configured Daily Goals */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Project Goals &amp; Output</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tasks completed vs project daily targets</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5 cursor-pointer"
                title="Edit Project Goals"
              >
                <span>Edit Goals</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {projectDistribution && projectDistribution.length > 0 ? (
                projectDistribution.map((p, idx) => (
                  <div key={p.projectName || p.name || idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color || '#0284c7' }}></span>
                        <span className="font-extrabold text-slate-900 truncate">{p.projectName || p.name}</span>
                      </div>
                      <span className="font-mono font-black text-amber-700">
                        {p.tasks} / {p.dailyGoal || 100}
                      </span>
                    </div>

                    {/* Progress against project specific goal */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                        <span>Project Daily Target: {p.dailyGoal || 100} tasks</span>
                        <span className="font-mono text-emerald-700">{p.goalProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.goalProgress || 0}%`, backgroundColor: p.color || '#0284c7' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No project activity logged for this date.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Leading Project:</span>
            <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 truncate max-w-[150px]">
              {topProject || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Team Leaderboard Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Member Performance Leaderboard</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top contributors, output vs goal, and pace for {selectedDate}.</p>
          </div>
          <button
            onClick={() => onNavigateTab('daily')}
            className="text-xs text-amber-700 hover:text-amber-800 font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <span>Daily Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="pb-3 pl-2">Rank &amp; Team Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-center">Total Tasks</th>
                <th className="pb-3 text-center">Hours Worked</th>
                <th className="pb-3 text-center">Tasks / Hour</th>
                <th className="pb-3 pr-2 text-right">Goal Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberLeaderboard && memberLeaderboard.length > 0 ? (
                memberLeaderboard.map((m, idx) => {
                  const memberPercent = Math.min(100, Math.round(((Number(m.totalTasks) || 0) / currentGoalNum) * 100));
                  const memberName = m.memberName || m.name || 'Team Member';
                  const memberRole = m.memberRole || m.role || 'Python Developer';
                  const memberColor = m.memberColor || m.avatarColor || '#0284c7';

                  return (
                    <tr key={m.memberId || m.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 text-center font-mono font-bold ${
                            idx === 0 ? 'text-amber-600 font-black' : idx === 1 ? 'text-slate-500 font-black' : idx === 2 ? 'text-amber-700 font-black' : 'text-slate-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                            style={{ backgroundColor: memberColor }}
                          >
                            {memberName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{memberName}</span>
                            <span className="text-[10px] text-slate-400">{m.department || 'IT'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 font-medium text-slate-600">
                        {memberRole}
                      </td>

                      <td className="py-3.5 text-center font-mono font-black text-amber-600 text-sm">
                        {m.totalTasks}
                      </td>

                      <td className="py-3.5 text-center font-mono text-slate-700 font-bold">
                        {m.hoursWorked} hrs
                      </td>

                      <td className="py-3.5 text-center font-mono font-bold text-sky-600">
                        {m.avgRate || '0.0'}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${memberPercent}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 w-9 text-right">
                            {memberPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No member activity records logged for {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
