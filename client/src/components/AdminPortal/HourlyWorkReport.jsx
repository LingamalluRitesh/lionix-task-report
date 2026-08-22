import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  Calendar, 
  FileSpreadsheet,
  RefreshCw,
  Plus,
  MessageSquare
} from 'lucide-react';
import { isTaskCountRequired } from '../../utils/projectUtils.js';

export const HourlyWorkReport = ({
  matrixData = {},
  hourlyLogs = [],
  members = [],
  projects = [],
  selectedDate,
  onDateChange,
  onEditLog,
  onDeleteLog,
  onAddNewLog,
  onRefresh,
  onExportCsv
}) => {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { allHours = [], matrix = [] } = matrixData;

  const filteredLogs = hourlyLogs.filter(log => {
    const matchesSearch = 
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.projectName && log.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.memberName && log.memberName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMember = filterMember === 'all' || log.memberId === filterMember;
    const matchesProject = filterProject === 'all' || log.projectId === filterProject;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesMember && matchesProject && matchesStatus;
  });

  const totalTasks = hourlyLogs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Hourly Work Report</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hourly breakdown for every team member. Click any cell to edit task counts or project assignment.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Matrix View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Detailed Log Table
              </button>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 shadow-xs">
              <Calendar className="w-4 h-4 text-sky-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Export CSV */}
            <button
              onClick={() => onExportCsv('hourly')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-xs"
              title="Download CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
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

        {/* Filter Bar for Table View */}
        {viewMode === 'table' && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, projects, members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            >
              <option value="all">All Team Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        )}
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Team Hourly Matrix Grid — {selectedDate}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs border border-sky-200 font-mono font-bold">
                  {totalTasks} total tasks
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any cell to edit task counts or work notes. Data Annotation & Infography show task numbers; other projects show work logs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span> None</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-100 border border-sky-300"></span> Tasks (1-3)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></span> Tasks (4+)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300"></span> Work Message</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 sticky left-0 bg-white z-10 w-48 shadow-r">Team Member</th>
                  {allHours.map(hour => (
                    <th key={hour} className="py-3 px-2 text-center font-mono whitespace-nowrap min-w-[72px]">
                      {hour.split(' - ')[0]}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-mono sticky right-0 bg-white z-10">Output Summary</th>
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

                      {/* Hourly Cells */}
                      {allHours.map(hour => {
                        const log = row.hours[hour];
                        const isNumeric = log ? isTaskCountRequired(log.projectName) : false;
                        const tasks = log ? Number(log.taskCount) || 0 : 0;
                        
                        let cellClass = 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-100';
                        if (log) {
                          if (isNumeric) {
                            if (tasks >= 4) {
                              cellClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 font-bold';
                            } else if (tasks > 0) {
                              cellClass = 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100 font-bold';
                            } else {
                              cellClass = 'bg-sky-50/60 text-sky-700 border-sky-200 hover:bg-sky-100';
                            }
                          } else {
                            // Non-numeric project with work details / message
                            cellClass = 'bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100 font-semibold';
                          }
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
                              className={`w-full py-2 px-1 rounded-xl border text-center font-mono transition-all group relative cursor-pointer shadow-xs ${cellClass}`}
                              title={
                                log 
                                  ? `${log.projectName}${isNumeric ? `: ${log.taskCount} tasks.` : ' (Work Message):'} ${log.notes || ''} (Click to edit)`
                                  : `No log for ${hour} (Click to add)`
                              }
                            >
                              {log ? (
                                <div className="flex flex-col items-center justify-center">
                                  {isNumeric ? (
                                    <span className="text-xs font-extrabold">{tasks}</span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-0.5">
                                      ✓ Log
                                    </span>
                                  )}
                                  <span className="text-[9px] font-medium truncate max-w-[50px] opacity-80">
                                    {log.projectName ? log.projectName.split(' ')[0] : 'Proj'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300 group-hover:text-slate-500 text-xs">-</span>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Output Column */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-sky-600 sticky right-0 bg-white/95 z-10 border-l border-slate-100 text-sm">
                        {row.totalTasks > 0 ? (
                          <>
                            {row.totalTasks} <span className="text-[10px] font-normal text-slate-500">tasks</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-indigo-600">{row.hoursWorked} hrs</span>
                        )}
                        <span className="text-[10px] text-slate-400 block font-normal font-sans">
                          {row.hoursWorked} hrs logged
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

      {/* DETAILED TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Detailed Hourly Task Entries ({filteredLogs.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter, search, edit, or delete any record.</p>
            </div>
            <button
              onClick={() => onExportCsv('hourly')}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Time Slot</th>
                  <th className="pb-3">Team Member</th>
                  <th className="pb-3">Project Name</th>
                  <th className="pb-3 text-center">Tasks Done</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Task Details / Work Notes</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isNumeric = isTaskCountRequired(log.projectName);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-2 font-mono font-bold text-slate-700">
                          {log.hourSlot}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
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
                        <td className="py-3.5 text-center font-mono text-sm">
                          {isNumeric ? (
                            <span className="font-extrabold text-sky-600">{log.taskCount}</span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic">N/A (Message)</span>
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
                        <td className="py-3.5 text-slate-700 max-w-sm">
                          {log.notes ? (
                            <span className={!isNumeric ? "font-semibold text-slate-900" : "text-slate-600"}>
                              {log.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No notes</span>
                          )}
                        </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditLog(log)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sky-700 transition-colors shadow-xs"
                            title="Edit task log"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors shadow-xs"
                            title="Delete task log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
