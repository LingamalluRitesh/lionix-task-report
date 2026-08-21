import React from 'react';
import { 
  CheckCircle2, 
  Users, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  Award, 
  ArrowRight, 
  Calendar, 
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
  Cell
} from 'recharts';

export const AdminDashboard = ({ 
  overview = {}, 
  selectedDate, 
  onDateChange,
  onNavigateTab 
}) => {
  const {
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

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time aggregate performance, hourly task output, and active team contributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks Done"
          value={totalTasksToday}
          subtitle={`Across all team members on ${selectedDate}`}
          icon={CheckCircle2}
          color="sky"
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
          color="violet"
        />
        <StatCard
          title="Top Focus Project"
          value={topProject}
          subtitle={projectDistribution[0] ? `${projectDistribution[0].tasks} tasks completed` : 'No active tasks'}
          icon={Briefcase}
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Velocity Trend */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Team Hourly Output Velocity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tasks delivered during each hour block across all members</p>
            </div>
            <button
              onClick={() => onNavigateTab('hourly')}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              Hourly View <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 mt-4">
            {hourlyVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="hourSlot"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    tickFormatter={(val) => val.split(' - ')[0]}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value} tasks completed`, 'Team Output']}
                  />
                  <Bar dataKey="tasks" fill="#0284c7" radius={[6, 6, 0, 0]}>
                    {hourlyVelocity.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={idx % 2 === 0 ? '#0284c7' : '#4f46e5'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                No hourly logs recorded for {selectedDate}
              </div>
            )}
          </div>
        </div>

        {/* Project Distribution */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Project Workload Split
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribution of tasks across projects</p>
              </div>
              <button
                onClick={() => onNavigateTab('daily')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                Daily Report <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {projectDistribution.length > 0 ? (
                projectDistribution.map((proj) => {
                  const percentage = totalTasksToday > 0 ? Math.round((proj.tasks / totalTasksToday) * 100) : 0;
                  return (
                    <div key={proj.name} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }}></span>
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">{proj.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-slate-900">{proj.tasks} tasks</span>
                          <span className="text-[10px] text-slate-500 font-mono">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: proj.color || '#0284c7'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No project tasks logged for this date
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Team Productivity Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Member contributions for {selectedDate}</p>
          </div>
          <button
            onClick={() => onNavigateTab('hourly')}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
          >
            Full Matrix <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Team Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3 text-center">Hours Logged</th>
                <th className="pb-3 text-center">Tasks Done</th>
                <th className="pb-3 text-center">Tasks / Hr</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {memberLeaderboard.length > 0 ? (
                memberLeaderboard.map((member, index) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-400">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                          style={{ backgroundColor: member.avatarColor || '#0284c7' }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{member.name}</span>
                          <span className="text-[10px] text-slate-500">{member.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{member.role || 'Member'}</td>
                    <td className="py-3.5 text-center font-mono text-slate-700">{member.hoursLogged} hrs</td>
                    <td className="py-3.5 text-center font-mono font-extrabold text-sky-600 text-sm">
                      {member.totalTasks}
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-emerald-600">
                      {member.avgRate}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No team member activity recorded for {selectedDate}
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
