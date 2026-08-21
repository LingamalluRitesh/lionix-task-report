import React from 'react';
import { Target, TrendingUp, Briefcase, Zap, CheckCircle2, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DailySummaryCard = ({ member, selectedDate, logs = [], dailyTaskGoal = 20 }) => {
  const totalTasks = logs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);
  const hoursLogged = logs.length;
  const avgTasksPerHour = hoursLogged > 0 ? (totalTasks / hoursLogged).toFixed(1) : '0.0';

  const goal = Math.max(1, parseInt(dailyTaskGoal, 10) || 20);
  const goalPercent = Math.min(100, Math.round((totalTasks / goal) * 100));
  const isGoalMet = totalTasks >= goal;
  const remainingTasks = Math.max(0, goal - totalTasks);

  const projectMap = {};
  logs.forEach(log => {
    const pName = log.projectName || 'General';
    if (!projectMap[pName]) {
      projectMap[pName] = {
        name: pName,
        tasks: 0,
        color: log.projectColor || '#0284c7'
      };
    }
    projectMap[pName].tasks += Number(log.taskCount) || 0;
  });

  const projectsList = Object.values(projectMap);

  const chartData = logs
    .map(l => ({
      slot: l.hourSlot.split(' - ')[0] || l.hourSlot,
      fullSlot: l.hourSlot,
      tasks: Number(l.taskCount) || 0,
      project: l.projectName,
      color: l.projectColor || '#0284c7'
    }))
    .sort((a, b) => a.fullSlot.localeCompare(b.fullSlot));

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Daily Performance</h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {selectedDate}
          </span>
        </div>

        {/* 🎯 Daily Task Goal Card (Admin Set Target) */}
        <div className={`mt-4 p-4 rounded-2xl border transition-all ${
          isGoalMet
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/60 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {isGoalMet ? (
                <Award className="w-4 h-4 text-emerald-600" />
              ) : (
                <Target className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-xs font-extrabold uppercase tracking-wide">
                Daily Task Goal
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg bg-white shadow-xs border border-slate-200/60">
              Target: {goal} tasks
            </span>
          </div>

          {/* Goal Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>
                {totalTasks} of {goal} tasks completed
              </span>
              <span className="font-mono">{goalPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalMet
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${goalPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/40 text-[11px] font-bold">
            {isGoalMet ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                🎉 Excellent! You have achieved today's task target!
              </span>
            ) : (
              <span className="text-amber-800">
                ⏳ {remainingTasks} more {remainingTasks === 1 ? 'task' : 'tasks'} needed to meet today's goal.
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Done
            </span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5 block">
              {totalTasks}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Hours Logged
            </span>
            <span className="text-2xl font-extrabold text-slate-800 font-mono mt-0.5 block">
              {hoursLogged}h
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tasks / Hour
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 font-mono mt-0.5 block">
              {avgTasksPerHour}
            </span>
          </div>
        </div>

        {/* Velocity Bar Chart */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Hourly Velocity
            </span>
            <span className="text-[10px] text-slate-400 font-medium">9 AM – 6 PM tasks</span>
          </div>

          {chartData.length > 0 ? (
            <div className="h-32 w-full bg-slate-50 rounded-2xl p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="slot" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name, props) => [`${value} tasks`, `${props.payload.project}`]}
                    labelFormatter={(label, props) => props[0]?.payload?.fullSlot || label}
                  />
                  <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-28 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
              No tasks logged yet for this date
            </div>
          )}
        </div>

        {/* Project Breakdown List */}
        <div>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Projects Logged
          </span>
          {projectsList.length > 0 ? (
            <div className="space-y-2">
              {projectsList.map(proj => (
                <div
                  key={proj.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    ></span>
                    <span className="text-xs font-semibold text-slate-800">{proj.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    {proj.tasks} tasks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No projects recorded today.</p>
          )}
        </div>
      </div>

      {/* Motivation Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">
            {isGoalMet ? '🔥 High Output — Goal Met!' : totalTasks >= 10 ? '⚡ Good Progress' : '🌱 Keep Logging'}
          </p>
          <p className="text-[11px] text-slate-500">
            {totalTasks > 0 ? `${totalTasks} tasks logged across ${hoursLogged} working hours.` : 'Log hourly tasks to reach your daily target.'}
          </p>
        </div>
      </div>
    </div>
  );
};
