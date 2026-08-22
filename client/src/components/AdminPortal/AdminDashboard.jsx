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
  AlertTriangle
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
import { isTaskCountRequired } from '../../utils/projectUtils.js';

export const AdminDashboard = ({ 
  overview = {}, 
  selectedDate, 
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
  } = overview;

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
      const res = await api.updateSettings({ dailyTaskGoal: num });
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

  const currentGoalNum = Math.min(2999, Math.max(1, parseInt(goalInput, 10) || 100));
  const expectedTeamGoal = (activeMembersCount || totalMembers || 1) * currentGoalNum;
  const goalPercent = Math.min(100, Math.round((totalTasksToday / (expectedTeamGoal || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Filter */}
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

        <div className="flex items-center gap-3">
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

      {/* Daily Task Goal Configuration Banner (< 3000 limit) */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/20">
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
              Target for each employee across the 9:00 AM – 6:00 PM workday (valid range: 1 to 2,999 tasks).
            </p>
          </div>

          {/* Goal Editor Form with < 3000 validation */}
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
              className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
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
                  <span>Save Goal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Progress Bar towards Team Target */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-amber-100">
              Team Progress: {totalTasksToday} of {expectedTeamGoal} total target tasks
            </span>
            <span className="font-mono text-white">{goalPercent}% Achieved</span>
          </div>
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${goalPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks Done"
          value={totalTasksToday}
          subtitle={`Across all team members on ${selectedDate}`}
          icon={CheckCircle2}
          color="amber"
        />
        <StatCard
          title="Active Members"
          value={`${activeMembersCount} / ${totalMembers}`}
          subtitle="Members logged tasks today"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Team Velocity"
          value={`${avgTasksPerHour}`}
          subtitle="Avg tasks done per working hour"
          icon={TrendingUp}
          color="sky"
        />
        <StatCard
          title="Top Focus Project"
          value={topProject}
          subtitle="Highest task allocation today"
          icon={Briefcase}
          color="violet"
        />
      </div>

      {/* Middle Section: Hourly Velocity & Project Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Velocity Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Today's Hourly Task Velocity</h3>
              <p className="text-xs text-slate-400">Aggregated task volume per hour block across team</p>
            </div>
            <button
              onClick={() => onNavigateTab('hourly')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {hourlyVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis 
                    dataKey="hourSlot" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '1rem',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                  />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                    {hourlyVelocity.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill="#f59e0b" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-300" />
                <span>No hourly tasks logged yet for this date.</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Distribution Breakdown */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Project Allocation</h3>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Distribution of completed tasks by admin-assigned project</p>

            <div className="space-y-3">
              {projectDistribution.length > 0 ? (
                projectDistribution.map((item) => {
                  const isNumeric = isTaskCountRequired(item.name);
                  const pct = totalTasksToday > 0 ? Math.round((item.tasks / totalTasksToday) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#f59e0b' }} />
                          {item.name}
                        </span>
                        <span className="text-slate-500 font-mono">
                          {isNumeric ? `${item.tasks} tasks (${pct}%)` : (item.tasks > 0 ? `${item.tasks} tasks` : 'Work Logged')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: isNumeric ? `${pct}%` : '100%',
                            backgroundColor: item.color || '#f59e0b'
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <span>No project activity recorded yet.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Hours Logged: <strong className="text-slate-900 font-mono">{totalHoursLogged} hrs</strong></span>
            <span>Active Projects: <strong className="text-slate-900 font-mono">{projectDistribution.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Member Leaderboard */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900">Team Performance Leaderboard</h3>
          </div>
          <button
            onClick={() => onNavigateTab('daily')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Daily Workreport</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Team Member</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Hours Logged</th>
                <th className="pb-3">Tasks Completed</th>
                <th className="pb-3">Velocity (Tasks/Hr)</th>
                <th className="pb-3 pr-2 text-right">Goal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberLeaderboard.length > 0 ? (
                memberLeaderboard.map((mem, index) => {
                  const targetGoal = currentGoalNum;
                  const isGoalMet = mem.totalTasks >= targetGoal;
                  return (
                    <tr key={mem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-bold text-slate-400">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: mem.avatarColor || '#0284c7' }}
                          >
                            {mem.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block">{mem.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{mem.role || 'Member'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {mem.department || 'IT'}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-slate-600">{mem.hoursLogged} / 9 hrs</td>
                      <td className="py-3.5 font-mono font-extrabold text-slate-900 text-sm">
                        {mem.totalTasks}
                      </td>
                      <td className="py-3.5 font-mono text-amber-600 font-bold">{mem.avgRate}</td>
                      <td className="py-3.5 pr-2 text-right">
                        {isGoalMet ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Target Met
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {targetGoal - mem.totalTasks} to target
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No member activity recorded for this date yet.
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
