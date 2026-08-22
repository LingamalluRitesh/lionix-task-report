import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Users, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Award, 
  ArrowRight, 
  Calendar, 
  Activity,
  Target,
  Save,
  Flame,
  Check,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../UI/Toast.jsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

export const AdminDashboard = ({ 
  overview = {}, 
  selectedDate, 
  currentShift = 'morning',
  onShiftChange,
  onDateChange,
  onNavigateTab,
  onRefresh
}) => {
  const { addToast } = useToast();
  const {
    dailyTaskGoal: initialGoal = 100,
    totalTasksToday = 0,
    totalMembers = 0,
    activeMembersCount = 0,
    totalHoursLogged = 0,
    avgTasksPerHour = '0.0',
    topProject = 'None',
    projectDistribution = [],
    hourlyVelocity = [],
    memberLeaderboard = []
  } = overview || {};

  const [goalInput, setGoalInput] = useState(initialGoal);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    if (initialGoal) {
      setGoalInput(Math.min(2999, initialGoal));
    }
  }, [initialGoal]);

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const rawNum = parseInt(goalInput, 10);

    if (isNaN(rawNum) || rawNum < 1) {
      addToast('Daily task goal must be at least 1 task', 'error');
      return;
    }

    if (rawNum >= 3000) {
      addToast('Daily task goal must be less than 3,000 tasks (e.g. 1 to 2999)', 'error');
      return;
    }

    const num = Math.min(2999, Math.max(1, rawNum));
    setIsSavingGoal(true);
    try {
      const res = await api.updateSettings({ dailyTaskGoal: num, currentShift });
      if (res?.data?.dailyTaskGoal) {
        setGoalInput(res.data.dailyTaskGoal);
      } else {
        setGoalInput(num);
      }
      setGoalSaved(true);
      addToast(`Daily Task Goal set to ${num} tasks/day (< 3,000)`, 'success');
      setTimeout(() => setGoalSaved(false), 3000);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast('Failed to update daily task goal', 'error');
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleShiftSwitch = async (shift) => {
    try {
      await api.updateSettings({ currentShift: shift });
      if (onShiftChange) {
        onShiftChange(shift);
      }
      addToast(`Switched active workspace to ${shift === 'night' ? '🌙 Night Shift (8:00 PM – 5:00 AM)' : '☀️ Morning Shift (9:00 AM – 6:00 PM)'}`, 'success');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      addToast('Failed to change active shift', 'error');
    }
  };

  const currentGoalNum = Math.min(2999, Math.max(1, parseInt(goalInput, 10) || 100));
  const expectedTeamGoal = (activeMembersCount || totalMembers || 1) * currentGoalNum;
  const goalPercent = Math.min(100, Math.round((totalTasksToday / (expectedTeamGoal || 1)) * 100));
  const isNightShift = currentShift === 'night';

  // Safe normalized hourly velocity for chart
  const normalizedVelocity = (hourlyVelocity || []).map(entry => ({
    hour: entry.hour || entry.hourSlot || '',
    tasks: Number(entry.tasks) || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">LionIX Admin Dashboard</h2>
              <p className="text-xs text-slate-500">
                Executive performance metrics, team reports, and daily task targets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
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
                Daily Task Target Goal (Max: &lt; 3,000 tasks)
              </span>
            </div>
            <h3 className="text-xl font-black">
              Standard Daily Goal: {currentGoalNum} Tasks / Member
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Target for each employee across the {isNightShift ? '8:00 PM – 5:00 AM Night Shift' : '9:00 AM – 6:00 PM Morning Shift'} (valid range: 1 to 2,999 tasks).
            </p>
          </div>

          {/* Goal Editor Form */}
          <form onSubmit={handleSaveGoal} className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="text-xs font-bold text-white">Daily Target:</span>
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
        </div>

        {/* Live Goal Progress Tracking */}
        <div className="mt-5 pt-5 border-t border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2 mb-2">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-200" />
              <span>
                Team Progress: <strong className="font-mono text-base font-black text-white">{totalTasksToday}</strong> of <strong className="font-mono">{expectedTeamGoal}</strong> Expected Tasks
              </span>
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono font-extrabold">
              {goalPercent}% Completed
            </span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${goalPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks Completed"
          value={totalTasksToday}
          subtitle={`Across ${activeMembersCount} active members`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active IT Contributors"
          value={`${activeMembersCount} / ${totalMembers}`}
          subtitle="Team members who logged hours"
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Shift Hours Logged"
          value={`${totalHoursLogged} hrs`}
          subtitle={isNightShift ? '8:00 PM – 5:00 AM logs' : '9:00 AM – 6:00 PM logs'}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Avg Tasks / Hour"
          value={avgTasksPerHour}
          subtitle="Average team throughput pace"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Velocity Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {isNightShift ? 'Night Shift Hourly Velocity (8 PM – 5 AM)' : 'Morning Shift Hourly Velocity (9 AM – 6 PM)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated task output completed during each work hour.</p>
            </div>
            <button
              onClick={() => onNavigateTab('hourly')}
              className="text-xs text-amber-700 hover:text-amber-800 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
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
                    formatter={(val) => [`${val} tasks`, 'Completed']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                    {normalizedVelocity.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={isNightShift ? (entry.tasks > 0 ? '#4f46e5' : '#cbd5e1') : (entry.tasks > 0 ? '#d97706' : '#cbd5e1')}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No hourly task activity logged for {selectedDate}.
              </div>
            )}
          </div>
        </div>

        {/* Project Task Distribution */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Project Breakdown</h3>
                <p className="text-xs text-slate-500 mt-0.5">Task distribution per project</p>
              </div>
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-3.5">
              {projectDistribution && projectDistribution.length > 0 ? (
                projectDistribution.map((p, idx) => (
                  <div key={p.projectName || p.name || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color || '#0284c7' }}></span>
                        <span className="font-bold text-slate-800 truncate">{p.projectName || p.name}</span>
                      </div>
                      <span className="font-mono font-extrabold text-slate-900">{p.tasks} ({p.percentage || 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.percentage || 0}%`, backgroundColor: p.color || '#0284c7' }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No project activity logged for this date.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Focus:</span>
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
                          <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-xs font-mono shadow-2xs ${
                            idx === 0
                              ? 'bg-amber-500 text-white'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                            style={{ backgroundColor: memberColor }}
                          >
                            {memberName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{memberName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">
                        {memberRole}
                      </td>
                      <td className="py-3.5 text-center font-mono font-black text-amber-600 text-sm">
                        {m.totalTasks || 0}
                      </td>
                      <td className="py-3.5 text-center font-mono text-slate-700">
                        {m.hoursWorked || m.hoursLogged || 0} hrs
                      </td>
                      <td className="py-3.5 text-center font-mono font-bold text-sky-600">
                        {m.avgTasksPerHour || m.avgRate || '0.0'}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${memberPercent}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-extrabold text-slate-700 w-9 text-right">
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
                    No task activity recorded for {selectedDate}.
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
