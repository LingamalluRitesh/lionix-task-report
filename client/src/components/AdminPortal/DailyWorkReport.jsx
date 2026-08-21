import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Search,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';

export const DailyWorkReport = ({
  summaries = [],
  members = [],
  selectedDate,
  onDateChange,
  onRefresh,
  onExportCsv
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('all');

  const filteredSummaries = summaries.filter(s => {
    const matchesSearch = 
      (s.memberName && s.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.memberRole && s.memberRole.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMember = filterMember === 'all' || s.memberId === filterMember;

    return matchesSearch && matchesMember;
  });

  const totalTasks = summaries.reduce((acc, s) => acc + (Number(s.totalTasks) || 0), 0);
  const totalHours = summaries.reduce((acc, s) => acc + (Number(s.hoursWorked) || 0), 0);
  const avgTasksPerPerson = summaries.length > 0 ? (totalTasks / summaries.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Daily Work Report</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aggregated daily output per person, project task distribution, and productivity pace.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => onExportCsv('daily')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-xs"
              title="Download Daily CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Daily CSV</span>
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Refresh Report"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by member name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
          >
            <option value="all">All Team Members ({members.length})</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Tasks Done"
          value={totalTasks}
          subtitle={`Aggregated for ${selectedDate}`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Hours Logged"
          value={`${totalHours} hrs`}
          subtitle={`Across ${summaries.length} active team members`}
          icon={TrendingUp}
          color="sky"
        />
        <StatCard
          title="Avg Tasks / Person"
          value={avgTasksPerPerson}
          subtitle="Average productivity per contributor"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Daily Summary Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Member-wise Daily Output Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tasks total, project distribution, and velocity for {selectedDate}.</p>
          </div>
          <button
            onClick={() => onExportCsv('daily')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2">Team Member</th>
                <th className="pb-3 text-center">Total Tasks</th>
                <th className="pb-3 text-center">Hours Logged</th>
                <th className="pb-3 text-center">Tasks / Hr</th>
                <th className="pb-3">Projects Breakdown</th>
                <th className="pb-3 text-right pr-2">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((summary) => {
                  const tasksNum = Number(summary.totalTasks) || 0;
                  return (
                    <tr key={summary.memberId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                            style={{ backgroundColor: summary.memberColor || '#0284c7' }}
                          >
                            {summary.memberName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{summary.memberName}</span>
                            <span className="text-[10px] text-slate-400">{summary.memberRole}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 text-center font-mono font-extrabold text-emerald-600 text-sm">
                        {summary.totalTasks}
                      </td>

                      <td className="py-4 text-center font-mono text-slate-700">
                        {summary.hoursWorked} hrs
                      </td>

                      <td className="py-4 text-center font-mono font-bold text-sky-600">
                        {summary.avgTasksPerHour}
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {summary.projectsList && summary.projectsList.length > 0 ? (
                            summary.projectsList.map(p => (
                              <span
                                key={p.projectName}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-medium shadow-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || '#0284c7' }}></span>
                                <span className="truncate max-w-[120px]">{p.projectName}:</span>
                                <span className="font-mono font-extrabold text-slate-900">{p.tasks}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 text-right pr-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          tasksNum >= 20
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tasksNum >= 10
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tasksNum >= 20 ? '🔥 High Output' : tasksNum >= 10 ? '⚡ Good Progress' : '🌱 Light Load'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No daily summary records found for {selectedDate}
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
