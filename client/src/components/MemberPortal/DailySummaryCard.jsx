import React from 'react';
import { Target, TrendingUp, Briefcase, Zap, CheckCircle2, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DailySummaryCard = ({ member, selectedDate, logs = [], projects = [], dailyTaskGoal = 100 }) => {
  const totalTasks = logs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);
  const hoursLogged = logs.length;
  const avgTasksPerHour = hoursLogged > 0 ? (totalTasks / hoursLogged).toFixed(1) : '0.0';

  // Determine active project daily goal
  const firstLogWithProj = logs.find(l => l.projectId);
  const matchedProject = firstLogWithProj
    ? projects.find(p => p.id === firstLogWithProj.projectId)
    : projects[0];
  const projectName = matchedProject?.name || 'Project';
  const goal = Math.max(1, parseInt(matchedProject?.dailyGoal || dailyTaskGoal, 10) || 100);

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

        {/* 🎯 Daily Task Goal Card (Project-Specific Target) */}
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
                {projectName} Target Goal
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
                ⏳ {remainingTasks} more tasks needed to reach the {projectName} daily goal.
              </span>
            )}
          </div>
        </div>

        {/* Performance Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Output
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{totalTasks}</span>
              <span className="text-xs text-slate-500 font-bold">tasks</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Pace (Rate)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{avgTasksPerHour}</span>
              <span className="text-xs text-slate-500 font-bold">tasks/hr</span>
            </div>
          </div>
        </div>

        {/* Project Breakdown for Member */}
        {projectsList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              <span>Project Contribution</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {projectsList.map(p => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span>{p.name}:</span>
                  <span className="font-mono text-amber-600">{p.tasks}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hourly Output Bar Chart */}
      <div className="pt-4 border-t border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Hourly Distribution
        </span>
        <div className="h-32 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="slot"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(val, name, item) => [`${val} tasks (${item.payload.project || 'General'})`, 'Output']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
              No tasks logged yet for {selectedDate}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
