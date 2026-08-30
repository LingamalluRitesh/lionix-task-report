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
  Lock,
  Sun,
  Moon,
  Briefcase
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';
import { api } from '../../services/api.js';

export const MORNING_HOURS = [
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

export const NIGHT_HOURS = [
  '08:00 PM - 09:00 PM',
  '09:00 PM - 10:00 PM',
  '10:00 PM - 11:00 PM',
  '11:00 PM - 12:00 AM',
  '12:00 AM - 01:00 AM',
  '01:00 AM - 02:00 AM',
  '02:00 AM - 03:00 AM',
  '03:00 AM - 04:00 AM',
  '04:00 AM - 05:00 AM'
];

export function getLeadLogCellData(log) {
  if (!log) return { type: 'empty' };

  const statusLower = (log.status || '').trim().toLowerCase();
  const notes = (log.notes || '').trim();
  const notesLower = notes.toLowerCase();
  const tasks = Number(log.taskCount) || 0;

  if (statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'leave' || notesLower === 'on leave') {
    return {
      type: 'leave',
      label: 'Leave',
      notes: notesLower === 'leave' || notesLower === 'on leave' ? '' : notes
    };
  }

  if (statusLower === 'lunch break' || statusLower === 'lunch' || notesLower === 'lunch' || notesLower === 'lunch break') {
    return {
      type: 'lunch',
      label: 'Lunch',
      notes: notesLower === 'lunch' || notesLower === 'lunch break' ? '' : notes
    };
  }

  if (tasks > 0) {
    return {
      type: 'tasks',
      tasks,
      notes
    };
  }

  if (notes.length > 0) {
    return {
      type: 'notes_only',
      notes
    };
  }

  return { type: 'empty' };
}

export const LeadPortal = ({
  currentUser,
  selectedDate,
  currentShift = 'morning',
  projects = [],
  onShiftChange,
  onDateChange,
  onExportExcel,
  onExportCsv
}) => {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'daily'
  const [activeShift, setActiveShift] = useState(currentShift);
  const [leadData, setLeadData] = useState({
    totalTeamTasks: 0,
    totalHoursLogged: 0,
    avgTeamTasksPerHour: '0.0',
    topTeamProject: 'None',
    teamMembers: [],
    teamSummaries: []
  });
  const [matrixData, setMatrixData] = useState({ allHours: [], matrix: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setActiveShift(currentShift);
  }, [currentShift]);

  const allHours = activeShift === 'night' ? NIGHT_HOURS : MORNING_HOURS;

  const fetchLeadData = async () => {
    if (!currentUser?.id) return;
    try {
      const [overview, matrix] = await Promise.all([
        api.getLeadOverview(currentUser.id, { date: selectedDate }),
        api.getMatrix(selectedDate, currentUser.id)
      ]);

      if (overview) {
        setLeadData(overview);
      }
      if (matrix) {
        setMatrixData(matrix);
      }
    } catch (err) {
      console.error('Error fetching Lead Portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [currentUser?.id, selectedDate, activeShift]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeadData();
    setIsRefreshing(false);
  };

  const handleAssignProjectToTeammate = async (memberId, projectId) => {
    const proj = projects.find(p => p.id === projectId);
    try {
      await api.assignMemberProject(memberId, projectId, proj?.name || '');
      await fetchLeadData();
    } catch (err) {
      alert('Failed to assign project to teammate');
    }
  };

  const isNightShift = activeShift === 'night';

  return (
    <div className="space-y-6">
      {/* Top Banner Card for Team Lead */}
      <div className={`rounded-3xl p-6 text-white shadow-xl transition-all ${
        isNightShift
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30'
          : 'bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 border border-amber-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight">{currentUser.name} — Team Lead Portal</h1>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> View-Only Access
                  </span>
                </div>
                <p className="text-xs text-white/80">
                  Assigned Team Workforce Intelligence &amp; Project Progress Tracking ({leadData.teamMembers.length} Teammates)
                </p>
              </div>
            </div>
          </div>

          {/* Controls & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Shift Switcher */}
            <div className="flex items-center p-1 bg-white/20 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => onShiftChange && onShiftChange('morning')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  !isNightShift ? 'bg-white text-amber-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Morning</span>
              </button>
              <button
                type="button"
                onClick={() => onShiftChange && onShiftChange('night')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isNightShift ? 'bg-white text-indigo-950 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </button>
            </div>

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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 text-xs font-black shadow-md transition-all cursor-pointer"
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
          title="Assigned Teammates"
          value={leadData.teamMembers.length}
          subtitle="Members assigned to your supervision"
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Avg Team Velocity"
          value={`${leadData.avgTeamTasksPerHour} / hr`}
          subtitle="Real-time completed tasks per working hour"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Hourly Work Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Daily Team Summary</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            (View-Only Matrix &amp; Project Assignments)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Leave (Red)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Lunch Break
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Completed Tasks
          </span>
        </div>
      </div>

      {/* TAB 1: VIEW-ONLY HOURLY WORK MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Assigned Team Hourly Progress — {selectedDate}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays full project names and complete visible work descriptions for all {allHours.length} hours of the shift.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {allHours.length} Active Slots
            </span>
          </div>

          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider bg-slate-50/70">
                <th className="py-3 px-3 sticky left-0 bg-slate-50 z-20 w-56 border-r border-slate-200">
                  Teammate &amp; Assigned Project
                </th>
                {allHours.map((hour) => (
                  <th key={hour} className="py-3 px-2 text-center whitespace-nowrap min-w-[130px]">
                    <span className="font-mono text-[10px] text-slate-700 block">{hour.split(' - ')[0]}</span>
                    <span className="text-[8px] text-slate-400 font-sans block">{hour.split(' - ')[1]}</span>
                  </th>
                ))}
                <th className="py-3 px-3 text-right sticky right-0 bg-slate-50 z-20 w-24 border-l border-slate-200">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {matrixData.matrix && matrixData.matrix.length > 0 ? (
                matrixData.matrix.map((row) => (
                  <tr key={row.member.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Member Info & Project Assignment */}
                    <td className="py-3.5 px-3.5 sticky left-0 bg-white/95 z-10 border-r border-slate-200/80">
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs mt-0.5"
                          style={{ backgroundColor: row.member.avatarColor || '#0284c7' }}
                        >
                          {row.member.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{row.member.name}</span>
                          <span className="text-[10px] text-slate-400 block">{row.member.role}</span>
                          
                          {/* Project Assignment Dropdown for Team Lead */}
                          <div className="mt-1 flex items-center gap-1">
                            <select
                              value={row.member.assignedProjectId || ''}
                              onChange={(e) => handleAssignProjectToTeammate(row.member.id, e.target.value)}
                              className="text-[10px] font-extrabold text-indigo-950 bg-indigo-50/80 border border-indigo-200 rounded-md px-1.5 py-0.5 max-w-[130px] truncate cursor-pointer focus:outline-none"
                              title="Assign Project to Teammate"
                            >
                              <option value="">No Project</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Hourly Cells */}
                    {allHours.map(hour => {
                      const log = row.hours ? row.hours[hour] : null;
                      const cellData = getLeadLogCellData(log);
                      const projectName = log?.projectName || 'General';
                      const projectColor = log?.projectColor || '#0284c7';

                      let cellClass = 'bg-slate-50 text-slate-400 border-slate-200';
                      if (cellData.type === 'leave') {
                        cellClass = 'bg-rose-50/80 text-rose-700 border-rose-300 font-bold';
                      } else if (cellData.type === 'lunch') {
                        cellClass = 'bg-amber-50/80 text-amber-800 border-amber-300 font-bold';
                      } else if (cellData.type === 'tasks' || cellData.type === 'notes_only') {
                        cellClass = 'bg-emerald-50/40 text-emerald-950 border-emerald-200';
                      }

                      return (
                        <td key={hour} className="py-2 px-1.5 text-center align-top min-w-[130px]">
                          <div className={`p-2 rounded-2xl border min-h-[58px] flex flex-col items-center justify-center gap-1 transition-all ${cellClass}`}>
                            {cellData.type === 'leave' ? (
                              <div className="flex flex-col items-center justify-center gap-1 w-full">
                                <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                                  🏖️ Leave
                                </span>
                                {cellData.notes ? (
                                  <p className="text-[10px] font-medium text-rose-900 bg-white/95 px-2 py-1 rounded-md border border-rose-200 text-left whitespace-normal break-words w-full leading-tight shadow-2xs">
                                    {cellData.notes}
                                  </p>
                                ) : null}
                              </div>
                            ) : cellData.type === 'lunch' ? (
                              <div className="flex flex-col items-center justify-center gap-1 w-full">
                                <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                                  🍱 Lunch
                                </span>
                                {cellData.notes ? (
                                  <p className="text-[10px] font-medium text-amber-950 bg-white/95 px-2 py-1 rounded-md border border-amber-200 text-left whitespace-normal break-words w-full leading-tight shadow-2xs">
                                    {cellData.notes}
                                  </p>
                                ) : null}
                              </div>
                            ) : cellData.type === 'tasks' ? (
                              <div className="flex flex-col items-center justify-center gap-1 w-full">
                                <div className="flex items-center justify-between gap-1 w-full flex-wrap">
                                  <span className="inline-flex items-center gap-1 font-mono font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md text-[11px]">
                                    {cellData.tasks} <span className="text-[9px] font-bold text-emerald-600">tasks</span>
                                  </span>
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs whitespace-normal break-words"
                                    title={`Project: ${projectName}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }}></span>
                                    <span>{projectName}</span>
                                  </span>
                                </div>

                                {cellData.notes ? (
                                  <p className="text-[10px] font-medium text-slate-800 bg-white/95 px-2 py-1 rounded-md border border-slate-200 text-left whitespace-normal break-words w-full shadow-2xs leading-tight">
                                    {cellData.notes}
                                  </p>
                                ) : null}
                              </div>
                            ) : cellData.type === 'notes_only' ? (
                              <div className="flex flex-col items-center justify-center gap-1 w-full">
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs whitespace-normal break-words self-start"
                                  title={`Project: ${projectName}`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }}></span>
                                  <span>{projectName}</span>
                                </span>

                                <p className="text-[10px] font-semibold text-slate-900 bg-white/95 px-2 py-1 rounded-md border border-slate-200 text-left whitespace-normal break-words w-full shadow-2xs leading-tight">
                                  {cellData.notes}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs font-mono">-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Tasks */}
                    {(() => {
                      const loggedHourValues = Object.values(row.hours).filter(Boolean);
                      const isAllLeave = loggedHourValues.length > 0 && loggedHourValues.every(l => {
                        const statusLower = (l.status || '').toLowerCase();
                        const notesLower = (l.notes || '').toLowerCase();
                        return statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'on leave' || notesLower === 'leave';
                      });

                      return (
                        <td className="py-3.5 px-3.5 text-right sticky right-0 bg-white/95 z-10 border-l border-slate-200/80">
                          {isAllLeave ? (
                            <div className="flex flex-col items-end justify-center gap-0.5">
                              <span className="inline-flex items-center gap-1 font-sans text-[11px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md uppercase tracking-tight shadow-2xs">
                                🏖️ Leave
                              </span>
                              <span className="text-[10px] text-rose-500 font-bold font-mono">
                                0 tasks
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end justify-center">
                              <span className="font-mono font-black text-amber-600 text-sm block">
                                {row.totalTasks}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-normal font-sans">
                                {row.hoursWorked} hrs
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })()}
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

      {/* TAB 2: DAILY SUMMARY VIEW */}
      {viewMode === 'daily' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900">
              Assigned Team Daily Work Summary — {selectedDate}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated daily output and complete work log descriptions for your assigned team.
            </p>
          </div>

          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider bg-slate-50/70">
                <th className="py-3 pl-2">Teammate &amp; Assigned Project</th>
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
                  const notesList = (summary.logs || []).filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0 || l.status === 'On Leave' || l.status === 'Lunch Break');

                  return (
                    <tr key={summary.memberId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-2xs mt-0.5"
                            style={{ backgroundColor: summary.memberColor || '#0284c7' }}
                          >
                            {summary.memberName.charAt(0)}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{summary.memberName}</span>
                            <span className="text-[10px] text-slate-400 block">{summary.memberRole}</span>
                            <div className="mt-1">
                              <select
                                value={summary.assignedProjectId || ''}
                                onChange={(e) => handleAssignProjectToTeammate(summary.memberId, e.target.value)}
                                className="text-[10px] font-extrabold text-indigo-950 bg-indigo-50/80 border border-indigo-200 rounded-md px-1.5 py-0.5 max-w-[130px] truncate cursor-pointer focus:outline-none"
                                title="Assign Project to Teammate"
                              >
                                <option value="">No Project</option>
                                {projects.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>
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
                          {notesList.map((l, i) => {
                            const cellData = getLeadLogCellData(l);
                            return (
                              <div key={i} className="text-[11px] bg-slate-50 border border-slate-200/70 rounded-lg px-2 py-0.5 flex items-start gap-1.5 text-slate-700">
                                <span className="font-mono font-extrabold text-amber-700 shrink-0 text-[10px]">
                                  {l.hourSlot ? l.hourSlot.split(' - ')[0] : 'Log'}:
                                </span>
                                {cellData.type === 'leave' ? (
                                  <span className="text-rose-700 font-extrabold">🏖️ On Leave {cellData.notes ? ` - ${cellData.notes}` : ''}</span>
                                ) : cellData.type === 'lunch' ? (
                                  <span className="text-amber-800 font-bold">🍱 Lunch Break {cellData.notes ? ` - ${cellData.notes}` : ''}</span>
                                ) : (
                                  <span className="whitespace-normal break-words">{l.notes || `${l.taskCount} tasks`}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No summary data available for your assigned team on this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
