import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  Clock, 
  Eye, 
  TrendingUp, 
  RefreshCw,
  Table as TableIcon,
  FileText,
  Lock
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';
import { api } from '../../services/api.js';

const STANDARD_HOURS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM'
];

export const LeadPortal = ({
  currentUser,
  selectedDate,
  onDateChange,
  onExportExcel,
  onExportCsv
}) => {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'daily'
  const [leadData, setLeadData] = useState({
    teamMembers: [],
    teamLogs: [],
    teamSummaries: [],
    totalTeamTasks: 0,
    totalTeamHours: 0,
    assignedCount: 0
  });
  const [matrixData, setMatrixData] = useState({ allHours: [], matrix: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTeamData = async () => {
    if (!currentUser?.id) return;
    try {
      const [overviewRes, matrixRes] = await Promise.all([
        api.getLeadOverview(currentUser.id, selectedDate),
        api.getMatrix(selectedDate, currentUser.id)
      ]);

      if (overviewRes) setLeadData(overviewRes);
      if (matrixRes) setMatrixData(matrixRes);
    } catch (err) {
      console.error('Error loading lead overview:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTeamData();
  }, [currentUser?.id, selectedDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeamData();
  };

  const isCoordinator = (currentUser?.role || '').toLowerCase().includes('coordinator');
  const roleTitle = isCoordinator ? 'Team Coordinator' : 'Team Lead';
  const allHours = matrixData.allHours?.length > 0 ? matrixData.allHours : STANDARD_HOURS;

  return (
    <div className="space-y-6">
      {/* Lead Portal Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner shrink-0">
              {isCoordinator ? <Sparkles className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  {roleTitle} Portal
                </span>
                <span className="text-xs font-bold bg-black/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> View-Only Access
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">
                {currentUser.name}’s Team Overview
              </h1>
              <p className="text-xs text-amber-100 mt-0.5">
                Monitoring <strong>{leadData.assignedCount} assigned teammates</strong>. You can inspect hourly progress and export team spreadsheets.
              </p>
            </div>
          </div>

          {/* Controls & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-2xl px-3 py-2 text-white">
              <Calendar className="w-4 h-4 text-amber-200" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Export Excel (.xlsx) */}
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 text-xs font-black shadow-md transition-all cursor-pointer"
              title="Download Assigned Team Excel Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Team Excel</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer"
              title="Download Assigned Team CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer"
              title="Refresh Team Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Assigned Team */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Team Tasks Completed"
          value={leadData.totalTeamTasks}
          subtitle={`By your ${leadData.teamMembers.length} teammates on ${selectedDate}`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Total Hours Logged"
          value={`${leadData.totalTeamHours} hrs`}
          subtitle="9:00 AM – 6:00 PM session logs"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Assigned Teammates"
          value={leadData.teamMembers.length}
          subtitle="Team members under your coordination"
          icon={Users}
          color="sky"
        />
      </div>

      {/* View Switcher Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Assigned Team Workprogress
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hourly output &amp; work description notes logged by your assigned team members.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Hourly Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Daily Breakdown</span>
            </button>
          </div>
        </div>

        {/* View-Only Hourly Matrix */}
        {viewMode === 'matrix' && (
          <div className="mt-5 overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 sticky left-0 bg-white z-10 w-52">Assigned Teammate</th>
                  {allHours.map(hour => (
                    <th key={hour} className="py-3 px-2 text-center font-mono whitespace-nowrap min-w-[105px]">
                      {hour.split(' - ')[0]}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-mono sticky right-0 bg-white z-10 w-28">Total Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {matrixData.matrix && matrixData.matrix.length > 0 ? (
                  matrixData.matrix.map((row) => (
                    <tr key={row.member.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-3 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-xs"
                            style={{ backgroundColor: row.member.avatarColor || '#0284c7' }}
                          >
                            {row.member.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{row.member.name}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{row.member.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Hourly Cells (View-Only) */}
                      {allHours.map(hour => {
                        const log = row.hours ? row.hours[hour] : null;
                        const tasks = log ? Number(log.taskCount) || 0 : 0;
                        const hasNotes = Boolean(log && log.notes && log.notes.trim().length > 0);

                        let cellClass = 'bg-slate-50 text-slate-400 border-slate-200';
                        if (tasks > 0) {
                          cellClass = 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold';
                        } else if (hasNotes) {
                          cellClass = 'bg-amber-50 text-amber-900 border-amber-200 font-medium';
                        }

                        return (
                          <td key={hour} className="py-2 px-1 text-center">
                            <div className={`w-full py-2 px-1.5 rounded-xl border text-center transition-all shadow-2xs ${cellClass}`}>
                              {log ? (
                                <div className="flex flex-col items-center justify-center overflow-hidden gap-0.5">
                                  <div className="flex items-center gap-1 font-mono">
                                    <span className="text-xs font-black">{tasks}</span>
                                    <span className="text-[9px] font-bold opacity-75">tasks</span>
                                  </div>
                                  {log.notes ? (
                                    <span className="text-[9px] font-medium text-slate-700 bg-white/80 px-1 py-0.5 rounded border border-slate-200/60 truncate max-w-[95px] block" title={log.notes}>
                                      {log.notes}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-medium text-slate-400 opacity-80 truncate max-w-[85px]">
                                      {log.projectName ? log.projectName.split(' ')[0] : 'Done'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-xs">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Tasks */}
                      <td className="py-3.5 px-3 text-right font-mono font-extrabold text-amber-600 sticky right-0 bg-white/95 z-10 border-l border-slate-100 text-sm">
                        {row.totalTasks}
                        <span className="text-[10px] text-slate-400 block font-normal font-sans">
                          {row.hoursWorked} hrs
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={allHours.length + 2} className="py-8 text-center text-slate-400 font-medium">
                      No teammates are currently assigned to your team. Please ask the Administrator to assign team members.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View-Only Daily Breakdown */}
        {viewMode === 'daily' && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Teammate</th>
                  <th className="pb-3 text-center">Total Tasks</th>
                  <th className="pb-3 text-center">Hours Worked</th>
                  <th className="pb-3 text-center">Tasks / Hr</th>
                  <th className="pb-3">Projects Breakdown</th>
                  <th className="pb-3">Work Descriptions Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leadData.teamSummaries && leadData.teamSummaries.length > 0 ? (
                  leadData.teamSummaries.map((summary) => {
                    const notesList = (summary.logs || []).filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0);

                    return (
                      <tr key={summary.memberId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs"
                              style={{ backgroundColor: summary.memberColor || '#0284c7' }}
                            >
                              {summary.memberName.charAt(0)}
                            </span>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{summary.memberName}</span>
                              <span className="text-[10px] text-slate-400">{summary.memberRole}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-center font-mono font-black text-emerald-600 text-sm">
                          {summary.totalTasks}
                        </td>

                        <td className="py-3.5 text-center font-mono text-slate-700 font-bold">
                          {summary.hoursWorked} hrs
                        </td>

                        <td className="py-3.5 text-center font-mono font-bold text-sky-600">
                          {summary.avgTasksPerHour}
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {summary.projectsList && summary.projectsList.length > 0 ? (
                              summary.projectsList.map(p => (
                                <span
                                  key={p.projectName}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-medium"
                                >
                                  <span className="truncate max-w-[100px]">{p.projectName}:</span>
                                  <strong className="font-mono">{p.tasks}</strong>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5">
                          <div className="space-y-1 max-w-xs">
                            {notesList.map((l, i) => (
                              <div key={i} className="text-[11px] bg-slate-50 border border-slate-200/70 rounded-lg px-2 py-0.5 flex items-start gap-1.5 text-slate-700">
                                <span className="font-mono font-extrabold text-amber-700 shrink-0 text-[10px]">
                                  {l.hourSlot ? l.hourSlot.split(' - ')[0] : 'Log'}:
                                </span>
                                <span className="truncate">{l.notes || `${l.taskCount} tasks`}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No task records logged by your team for {selectedDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
