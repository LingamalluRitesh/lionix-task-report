import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  RefreshCw,
  FolderKanban,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag,
  Coffee,
  CalendarOff
} from 'lucide-react';
import { StatCard } from '../UI/StatCard.jsx';

export function getDailyLogCellData(log) {
  if (!log) return { type: 'empty' };

  const statusLower = (log.status || '').trim().toLowerCase();
  const notes = (log.notes || '').trim();
  const notesLower = notes.toLowerCase();
  const tasks = Number(log.taskCount) || 0;

  if (statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'leave' || notesLower === 'on leave') {
    return {
      type: 'leave',
      label: 'On Leave',
      notes: notesLower === 'leave' || notesLower === 'on leave' ? '' : notes
    };
  }

  if (
    statusLower === 'lunch break' || statusLower === 'lunch' || notesLower === 'lunch' || notesLower === 'lunch break' ||
    statusLower === 'dinner break' || statusLower === 'dinner' || notesLower === 'dinner' || notesLower === 'dinner break'
  ) {
    const isDinner = statusLower.includes('dinner') || notesLower.includes('dinner');
    return {
      type: 'lunch',
      isDinner,
      label: isDinner ? 'Dinner Break' : 'Lunch Break',
      notes: (notesLower === 'lunch' || notesLower === 'lunch break' || notesLower === 'dinner' || notesLower === 'dinner break') ? '' : notes
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

export const DailyWorkReport = ({
  summaries = [],
  members = [],
  selectedDate,
  onDateChange,
  onRefresh,
  onExportCsv,
  onExportExcel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleRowExpand = (memberId) => {
    setExpandedRow(prev => (prev === memberId ? null : memberId));
  };

  const filteredSummaries = summaries.filter(s => {
    const memberName = s.memberName || '';
    const memberRole = s.memberRole || '';
    const matchesSearch = memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          memberRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMember = filterMember === 'all' || s.memberId === filterMember;
    return matchesSearch && matchesMember;
  });

  const totalTasks = summaries.reduce((acc, s) => acc + (Number(s.totalTasks) || 0), 0);
  const totalHours = summaries.reduce((acc, s) => acc + (Number(s.hoursWorked) || 0), 0);
  const avgTasksPerPerson = summaries.length > 0 ? (totalTasks / summaries.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Daily Work &amp; Task Report</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  Executive Breakdown
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive summary with styled date badges, member roles, leave status, and detailed work descriptions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-700 transition-all cursor-pointer shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              type="button"
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              title="Download Microsoft Excel report with borders and full formatting"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel (.xlsx)</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
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
              Member-wise Daily Output &amp; Work Description Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review completed tasks, project breakdown, leave status, and all typed work descriptions for {selectedDate}.
            </p>
          </div>
          <button
            onClick={onExportExcel}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel (.xlsx)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2 w-28">Date</th>
                <th className="pb-3 w-56">Member Name &amp; Role</th>
                <th className="pb-3 text-center w-24">Total Tasks</th>
                <th className="pb-3 text-center w-24">Hours Worked</th>
                <th className="pb-3 text-center w-24">Tasks / Hr</th>
                <th className="pb-3 w-48">Projects Breakdown</th>
                <th className="pb-3">Work Descriptions &amp; Notes</th>
                <th className="pb-3 text-right pr-2 w-24">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSummaries.length > 0 ? (
                filteredSummaries.map((summary) => {
                  const isExpanded = expandedRow === summary.memberId;
                  const notesList = (summary.logs || []).filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0 || l.status === 'On Leave' || l.status === 'Lunch Break');

                  return (
                    <React.Fragment key={summary.memberId}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Date Label with Distinct Styling */}
                        <td className="py-4 pl-2 font-mono">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                            {summary.date || selectedDate}
                          </span>
                        </td>

                        {/* 2. Member Name Label with Distinct Styling */}
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0"
                              style={{ backgroundColor: summary.memberColor || '#0284c7' }}
                            >
                              {summary.memberName.charAt(0)}
                            </div>
                            <div>
                              {/* Distinct Colored Member Name Label */}
                              <span className="inline-block font-extrabold text-slate-900 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/70 text-xs shadow-2xs">
                                {summary.memberName}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                {summary.memberRole} • <strong className="text-amber-800 font-bold">{summary.memberDepartment || 'IT'}</strong>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Total Tasks */}
                        <td className="py-4 text-center font-mono font-black text-emerald-600 text-sm">
                          {summary.totalTasks}
                        </td>

                        {/* 4. Hours Worked */}
                        <td className="py-4 text-center font-mono text-slate-700 font-bold">
                          {summary.hoursWorked} hrs
                        </td>

                        {/* 5. Tasks / Hr */}
                        <td className="py-4 text-center font-mono font-bold text-sky-600">
                          {summary.avgTasksPerHour}
                        </td>

                        {/* 6. Projects Breakdown */}
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {summary.projectsList && summary.projectsList.length > 0 ? (
                              summary.projectsList.map(p => (
                                <span
                                  key={p.projectName}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-medium shadow-xs"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || '#0284c7' }}></span>
                                  <span className="truncate max-w-[100px]">{p.projectName}:</span>
                                  <span className="font-mono font-extrabold text-slate-900">{p.tasks}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>

                        {/* 7. Work Descriptions & Notes Column */}
                        <td className="py-4">
                          {notesList.length > 0 ? (
                            <div className="space-y-1 max-w-xs">
                              {notesList.slice(0, isExpanded ? notesList.length : 2).map((l, i) => {
                                const cellData = getDailyLogCellData(l);
                                return (
                                  <div key={i} className="text-[11px] bg-slate-50 border border-slate-200/70 rounded-lg px-2 py-1 flex items-start gap-1.5 text-slate-700">
                                    <span className="font-mono font-extrabold text-amber-700 shrink-0 text-[10px]">
                                      {l.hourSlot ? l.hourSlot.split(' - ')[0] : 'Log'}:
                                    </span>
                                    {cellData.type === 'leave' ? (
                                      <span className="text-rose-700 font-extrabold">🏖️ On Leave {cellData.notes ? ` - ${cellData.notes}` : ''}</span>
                                    ) : cellData.type === 'lunch' ? (
                                      <span className="text-amber-800 font-bold">🍱 Lunch Break {cellData.notes ? ` - ${cellData.notes}` : ''}</span>
                                    ) : (
                                      <span className="truncate">{l.notes || `${l.taskCount} tasks on ${l.projectName || 'General'}`}</span>
                                    )}
                                  </div>
                                );
                              })}
                              {notesList.length > 2 && !isExpanded && (
                                <button
                                  type="button"
                                  onClick={() => toggleRowExpand(summary.memberId)}
                                  className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 cursor-pointer"
                                >
                                  +{notesList.length - 2} more notes...
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No description logged</span>
                          )}
                        </td>

                        {/* 8. Expand / Details Button */}
                        <td className="py-4 text-right pr-2">
                          <button
                            type="button"
                            onClick={() => toggleRowExpand(summary.memberId)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-2xs cursor-pointer"
                            title={isExpanded ? 'Collapse notes' : 'Expand all hourly notes'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View with Full Hourly Timeline of Notes */}
                      {isExpanded && (
                        <tr className="bg-amber-50/20">
                          <td colSpan={8} className="p-4 pl-8 border-b border-slate-200/80">
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                <span>Complete Hourly Breakdown for {summary.memberName}:</span>
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {(summary.logs || []).map((l, idx) => {
                                  const cellData = getDailyLogCellData(l);
                                  return (
                                    <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-amber-800">{l.hourSlot}</span>
                                        {cellData.type === 'leave' ? (
                                          <span className="font-mono font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                                            🏖️ On Leave
                                          </span>
                                        ) : cellData.type === 'lunch' ? (
                                          <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                                            🍱 Lunch Break
                                          </span>
                                        ) : (
                                          <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                            {l.taskCount} tasks
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-slate-600 text-[11px] leading-snug">
                                        {cellData.type === 'leave' ? (
                                          <span className="text-rose-700 font-bold">On Leave {cellData.notes ? `(${cellData.notes})` : ''}</span>
                                        ) : cellData.type === 'lunch' ? (
                                          <span className="text-amber-800 font-bold">Lunch Break {cellData.notes ? `(${cellData.notes})` : ''}</span>
                                        ) : (
                                          l.notes || <span className="italic text-slate-400">No notes written</span>
                                        )}
                                      </p>
                                      <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                                        Project: <strong className="text-slate-700">{l.projectName || 'General'}</strong>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
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
