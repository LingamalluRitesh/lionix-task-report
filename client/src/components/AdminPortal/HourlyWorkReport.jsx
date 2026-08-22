import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Download, 
  Edit3, 
  Trash2, 
  Plus, 
  Eye, 
  CheckCircle2,
  Table as TableIcon,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Sun,
  Moon
} from 'lucide-react';

export const HourlyWorkReport = ({
  matrixData = { allHours: [], matrix: [] },
  hourlyLogs = [],
  members = [],
  projects = [],
  selectedDate,
  currentShift = 'morning',
  onShiftChange,
  onDateChange,
  onEditLog,
  onDeleteLog,
  onAddNewLog,
  onRefresh,
  onExportCsv,
  onExportExcel
}) => {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'table'
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isNightShift = currentShift === 'night';
  const allHours = matrixData.allHours?.length > 0 ? matrixData.allHours : [];
  
  // Filter Matrix
  const matrix = (matrixData.matrix || []).filter(row => {
    if (selectedMemberFilter && row.member.id !== selectedMemberFilter) return false;
    return true;
  });

  // Filter Detailed Table
  const filteredLogs = hourlyLogs.filter(log => {
    if (selectedMemberFilter && log.memberId !== selectedMemberFilter) return false;
    if (selectedProjectFilter && log.projectId !== selectedProjectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isNightShift ? 'bg-indigo-50 border border-indigo-200 text-indigo-600' : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}>
              {isNightShift ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Hourly Work Matrix &amp; Task Logs</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                  isNightShift ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isNightShift ? '🌙 Night Shift (8:00 PM – 5:00 AM)' : '☀️ Morning Shift (9:00 AM – 6:00 PM)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays exact task counts and work info descriptions side by side across all employee sessions.
              </p>
            </div>
          </div>

          {/* Controls & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Shift Switcher Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => onShiftChange && onShiftChange('morning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  !isNightShift ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning</span>
              </button>
              <button
                type="button"
                onClick={() => onShiftChange && onShiftChange('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isNightShift ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>Night</span>
              </button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Logs Table</span>
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
              <Calendar className="w-4 h-4 text-amber-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Member Filter */}
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="">All 15 Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 transition-all cursor-pointer shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {isNightShift ? '8:00 PM – 5:00 AM Night Shift Matrix' : '9:00 AM – 6:00 PM Morning Shift Matrix'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays task counts &amp; work description text side by side. Click any cell to inspect or edit.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span> None</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300"></span> Info Logged</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> Tasks Done</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 sticky left-0 bg-white z-10 w-52 shadow-r">Team Member</th>
                  {allHours.map(hour => (
                    <th key={hour} className="py-3 px-2 text-center font-mono whitespace-nowrap min-w-[105px]">
                      {hour.split(' - ')[0]}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-mono sticky right-0 bg-white z-10 w-28">Total Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {matrix.length > 0 ? (
                  matrix.map((row) => (
                    <tr key={row.member.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Member Column */}
                      <td className="py-3 px-3 sticky left-0 bg-white/95 z-10 border-r border-slate-100">
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

                      {/* Hourly Cells (Shows Task Count AND Work Info side-by-side) */}
                      {allHours.map(hour => {
                        const log = row.hours[hour];
                        const tasks = log ? Number(log.taskCount) || 0 : 0;
                        const hasNotes = Boolean(log && log.notes && log.notes.trim().length > 0);
                        
                        let cellClass = 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100';
                        if (tasks > 0) {
                          cellClass = 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 font-bold';
                        } else if (hasNotes) {
                          cellClass = 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-medium';
                        }

                        return (
                          <td key={hour} className="py-2 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (log) {
                                  onEditLog(log);
                                } else {
                                  onAddNewLog(row.member.id, hour);
                                }
                              }}
                              className={`w-full py-2 px-1.5 rounded-xl border text-center transition-all group relative cursor-pointer shadow-xs ${cellClass}`}
                              title={log ? `${log.projectName}: ${log.taskCount} tasks. ${log.notes || ''} (Click to edit)` : `No log for ${hour} (Click to add)`}
                            >
                              {log ? (
                                <div className="flex flex-col items-center justify-center overflow-hidden gap-0.5">
                                  {/* Task Count Badge */}
                                  <div className="flex items-center gap-1 font-mono">
                                    <span className="text-xs font-black">{tasks}</span>
                                    <span className="text-[9px] font-bold opacity-75">tasks</span>
                                  </div>
                                  {/* Work Description / Notes beside/below */}
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
                                <span className="text-slate-300 group-hover:text-slate-500 text-xs">-</span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Tasks Column */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-600 sticky right-0 bg-white/95 z-10 border-l border-slate-100 text-sm">
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
                      No employees have registered or logged hours yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED LOGS TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Detailed Hourly Log Records</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every logged time session, assigned project, task count, and work description text.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Total Logs: {filteredLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="pb-3 pl-2">Time Slot</th>
                  <th className="pb-3">Team Member</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3 text-center">No. of Tasks</th>
                  <th className="pb-3">Work Info / Description</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2 font-mono font-extrabold text-slate-800">
                        {log.hourSlot}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: log.memberColor || '#0284c7' }}
                          ></span>
                          <span className="font-bold text-slate-900">{log.memberName}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: log.projectColor || '#0284c7' }}></span>
                          {log.projectName}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-mono font-extrabold text-amber-600 text-sm">
                        {log.taskCount}
                      </td>
                      <td className="py-3.5 text-slate-700 max-w-sm">
                        {log.notes ? (
                          <span className="font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60 inline-block">
                            {log.notes}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No description</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {log.status || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditLog(log)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-700 transition-colors shadow-xs cursor-pointer"
                            title="Edit task log"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors shadow-xs cursor-pointer"
                            title="Delete task log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No hourly task records found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
