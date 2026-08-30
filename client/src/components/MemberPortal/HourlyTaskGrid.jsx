import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Trash2, 
  Save, 
  CheckCheck, 
  ChevronDown, 
  FolderKanban, 
  Check,
  ListTodo,
  Target,
  Sun,
  Moon,
  CalendarOff,
  Briefcase
} from 'lucide-react';

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

export const HourlyTaskGrid = ({
  memberId,
  member,
  selectedDate,
  currentShift = 'morning',
  onShiftChange,
  projects = [],
  logs = [],
  onSaveLog,
  onDeleteLog
}) => {
  const [formState, setFormState] = useState({});
  const [savingSlot, setSavingSlot] = useState(null);
  const [activeShift, setActiveShift] = useState(currentShift);

  useEffect(() => {
    setActiveShift(currentShift);
  }, [currentShift]);

  const activeHours = activeShift === 'night' ? NIGHT_HOURS : MORNING_HOURS;

  // Derive default project assigned by Admin / Team Lead
  const defaultProjectId = member?.assignedProjectId || (projects.length > 0 ? projects[0].id : '');
  const defaultProjectName = member?.assignedProjectName || (projects.find(p => p.id === defaultProjectId)?.name || (projects[0]?.name || ''));

  useEffect(() => {
    const stateMap = {};

    activeHours.forEach(slot => {
      stateMap[slot] = {
        id: null,
        projectId: defaultProjectId,
        projectName: defaultProjectName,
        taskCount: 0,
        notes: '',
        status: 'Completed',
        isDirty: false,
        isSaved: false
      };
    });

    logs.forEach(log => {
      if (activeHours.includes(log.hourSlot)) {
        stateMap[log.hourSlot] = {
          id: log.id,
          projectId: log.projectId || defaultProjectId,
          projectName: log.projectName || defaultProjectName,
          taskCount: log.taskCount !== undefined ? log.taskCount : 0,
          notes: log.notes || '',
          status: log.status || 'Completed',
          isDirty: false,
          isSaved: true
        };
      }
    });

    setFormState(stateMap);
  }, [logs, projects, memberId, member, selectedDate, activeShift, defaultProjectId, defaultProjectName]);

  const handleFieldChange = (slot, field, value) => {
    setFormState(prev => {
      const current = prev[slot] || {
        projectId: defaultProjectId,
        projectName: defaultProjectName,
        taskCount: 0,
        notes: '',
        status: 'Completed'
      };

      let updated = {
        ...current,
        [field]: value,
        isDirty: true,
        isSaved: false
      };

      if (field === 'projectId') {
        const proj = projects.find(p => p.id === value);
        if (proj) updated.projectName = proj.name;
      }

      return {
        ...prev,
        [slot]: updated
      };
    });
  };

  const handleSave = async (slot) => {
    const data = formState[slot];
    if (!data) return;
    if (projects.length === 0) {
      alert('Please ask your Administrator to add projects first.');
      return;
    }

    let finalCount = parseInt(data.taskCount, 10);
    if (isNaN(finalCount) || finalCount < 0) {
      finalCount = 0;
    }

    setSavingSlot(slot);
    try {
      await onSaveLog({
        id: data.id,
        memberId,
        date: selectedDate,
        hourSlot: slot,
        projectId: data.projectId || defaultProjectId,
        projectName: data.projectName || defaultProjectName,
        taskCount: finalCount,
        notes: data.notes || '',
        status: data.status || 'Completed'
      });

      setFormState(prev => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          taskCount: finalCount,
          isDirty: false,
          isSaved: true
        }
      }));
    } finally {
      setSavingSlot(null);
    }
  };

  // When ANY leave action or dropdown selection happens, update ENTIRE today's grid to On Leave!
  const handleMarkEntireDayOnLeave = async () => {
    if (projects.length === 0) {
      alert('Please ask your Administrator to add projects first.');
      return;
    }

    for (const slot of activeHours) {
      const current = formState[slot] || {};
      await onSaveLog({
        id: current.id || null,
        memberId,
        date: selectedDate,
        hourSlot: slot,
        projectId: current.projectId || defaultProjectId,
        projectName: current.projectName || defaultProjectName,
        taskCount: 0,
        notes: 'On Leave',
        status: 'On Leave'
      });
    }

    setFormState(prev => {
      const nextState = { ...prev };
      activeHours.forEach(slot => {
        nextState[slot] = {
          ...(prev[slot] || {}),
          taskCount: 0,
          notes: 'On Leave',
          status: 'On Leave',
          isDirty: false,
          isSaved: true
        };
      });
      return nextState;
    });
  };

  const handleDelete = async (slot) => {
    const data = formState[slot];
    if (!data || !data.id) {
      setFormState(prev => ({
        ...prev,
        [slot]: {
          id: null,
          projectId: defaultProjectId,
          projectName: defaultProjectName,
          taskCount: 0,
          notes: '',
          status: 'Completed',
          isDirty: false,
          isSaved: false
        }
      }));
      return;
    }

    if (window.confirm(`Delete task log for ${slot}?`)) {
      await onDeleteLog(data.id);
    }
  };

  const handleShiftSwitch = (shift) => {
    setActiveShift(shift);
    if (onShiftChange) {
      onShiftChange(shift);
    }
  };

  const hasProjects = projects.length > 0;
  const loggedCount = activeHours.filter(s => formState[s]?.isSaved && formState[s]?.id).length;
  const progressPercent = Math.round((loggedCount / activeHours.length) * 100);

  // Determine active project being worked on by the employee
  const activeLogWithProj = activeHours.map(s => formState[s]).find(e => e?.projectId && (e?.isSaved || Number(e?.taskCount) > 0 || (e?.notes && e.notes.trim() !== '')));
  const activeProjectId = activeLogWithProj?.projectId || formState[activeHours[0]]?.projectId || defaultProjectId;
  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectSpecificDailyGoal = currentProject?.dailyGoal || 100;

  // Check if today is completely on leave
  const isEntireDayOnLeave = activeHours.every(slot => {
    const entry = formState[slot];
    return entry && (entry.status === 'On Leave' || entry.notes?.toLowerCase() === 'on leave' || entry.notes?.toLowerCase() === 'leave');
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
      {/* Header & Day Progress Banner */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              activeShift === 'night'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}>
              {activeShift === 'night' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Hourly Task Session</h2>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                  activeShift === 'night'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {activeShift === 'night' ? '🌙 Night Shift: 8:00 PM – 5:00 AM' : '☀️ Morning Shift: 9:00 AM – 6:00 PM'}
                </span>
                {isEntireDayOnLeave ? (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-mono">
                    🏖️ Entire Day On Leave
                  </span>
                ) : (
                  /* Employee ONLY sees the target goal of their specific project */
                  <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 font-mono shadow-2xs">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{currentProject?.name || 'Project'} Goal: <strong>{projectSpecificDailyGoal} tasks/day</strong></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Log your hourly task output. You can switch projects worked per hour slot.
              </p>
            </div>
          </div>

          {/* Top Quick Actions & Shift Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mark Entire Day On Leave Button */}
            <button
              type="button"
              onClick={handleMarkEntireDayOnLeave}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                isEntireDayOnLeave
                  ? 'bg-rose-600 text-white shadow-rose-600/25 ring-2 ring-rose-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
              title="Clicking Leave sets the entire today grid to On Leave"
            >
              <CalendarOff className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isEntireDayOnLeave ? '✓ Today On Leave' : '🏖️ Mark Today On Leave'}</span>
            </button>

            {/* Shift Switcher Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleShiftSwitch('morning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeShift === 'morning'
                    ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Morning (9AM-6PM)</span>
              </button>
              <button
                type="button"
                onClick={() => handleShiftSwitch('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeShift === 'night'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span>Night (8PM-5AM)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-700 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-amber-600" />
              Shift Progress: {loggedCount} of {activeHours.length} hours logged
            </span>
            <span className="font-mono text-amber-700">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeShift === 'night'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning banner if Admin has not added projects yet */}
      {!hasProjects && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <FolderKanban className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">No Projects Added Yet</span>
            <p className="mt-0.5 text-amber-700">
              Projects are managed by the Administrator. Please have your Admin create project names in the Admin Portal before logging tasks.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Shift Task Rows with Clean Spacious Responsive Layout */}
      <div className="mt-6 space-y-4">
        {activeHours.map((slot, index) => {
          const entry = formState[slot] || {
            taskCount: 0,
            projectId: defaultProjectId,
            projectName: defaultProjectName,
            notes: '',
            status: 'Completed',
            isDirty: false,
            isSaved: false
          };

          const isLeave = entry.status === 'On Leave' || entry.notes?.toLowerCase() === 'on leave' || entry.notes?.toLowerCase() === 'leave';
          const isMealBreak = entry.status === 'Lunch Break' || entry.status === 'Dinner Break' || entry.notes?.toLowerCase().includes('lunch') || entry.notes?.toLowerCase().includes('dinner');
          const mealBreakLabel = activeShift === 'night' ? '🍽️ Dinner' : '🍱 Lunch';
          const mealBreakFullTitle = activeShift === 'night' ? 'Dinner Break' : 'Lunch Break';

          const isSaved = entry.isSaved && !entry.isDirty && entry.id;
          const isDirty = entry.isDirty;
          const isSaving = savingSlot === slot;

          let rowBgClass = 'bg-white border-slate-200 hover:border-slate-300 shadow-xs';
          if (isLeave) {
            rowBgClass = 'bg-rose-50/50 border-rose-300 hover:border-rose-400 shadow-xs ring-1 ring-rose-200/50';
          } else if (isMealBreak) {
            rowBgClass = 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs';
          } else if (isSaved) {
            rowBgClass = 'bg-emerald-50/30 border-emerald-200/80 shadow-xs hover:border-emerald-300';
          } else if (isDirty) {
            rowBgClass = 'bg-amber-50/40 border-amber-300 shadow-sm ring-1 ring-amber-200';
          }

          return (
            <div
              key={slot}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 ${rowBgClass}`}
            >
              <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                {/* 1. Slot Number & Time */}
                <div className="flex items-center gap-3 xl:w-56 shrink-0">
                  <span className={`flex items-center justify-center w-9 h-9 rounded-2xl text-xs font-mono font-extrabold shrink-0 shadow-xs ${
                    isLeave
                      ? 'bg-rose-100 text-rose-900 font-black'
                      : isMealBreak
                      ? 'bg-amber-100 text-amber-900 font-black'
                      : activeShift === 'night'
                      ? 'bg-indigo-100/80 text-indigo-900 font-extrabold'
                      : 'bg-amber-100/70 text-amber-900 font-extrabold'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-extrabold text-slate-900 font-mono tracking-tight block">
                      {slot}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isLeave ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                          🏖️ On Leave
                        </span>
                      ) : isMealBreak ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                          {activeShift === 'night' ? '🍽️ Dinner Break' : '🍱 Lunch Break'}
                        </span>
                      ) : isSaved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> Logged &amp; Saved
                        </span>
                      ) : isDirty ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md animate-pulse">
                          ● Unsaved Edits
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Pending Entry</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Responsive Form Controls Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                  {/* Project Worked (3 cols) */}
                  <div className="lg:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Project Worked
                    </label>
                    <div className="relative">
                      <select
                        value={entry.projectId || ''}
                        onChange={(e) => handleFieldChange(slot, 'projectId', e.target.value)}
                        disabled={!hasProjects || isLeave}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none appearance-none cursor-pointer pr-7 hover:border-slate-300 transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed truncate"
                      >
                        {hasProjects ? (
                          projects.map(proj => (
                            <option key={proj.id} value={proj.id}>
                              {proj.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No projects added</option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* No. of Tasks (2 cols) */}
                  <div className="lg:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      No. of Tasks
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        disabled={!hasProjects || isLeave || isMealBreak}
                        placeholder={isLeave ? 'Leave' : isMealBreak ? (activeShift === 'night' ? 'Dinner' : 'Lunch') : '0'}
                        value={entry.taskCount === 0 ? '' : entry.taskCount}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          handleFieldChange(slot, 'taskCount', val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-extrabold rounded-2xl pl-3 pr-11 py-2.5 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none hover:border-slate-300 transition-all shadow-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-slate-400 uppercase pointer-events-none">
                        {isLeave ? 'OFF' : isMealBreak ? 'BREAK' : 'Tasks'}
                      </span>
                    </div>
                  </div>

                  {/* Work Description (4 cols - generous breathing room) */}
                  <div className="lg:col-span-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Work Info / Description
                    </label>
                    <input
                      type="text"
                      disabled={!hasProjects}
                      placeholder={isLeave ? 'On Leave' : isMealBreak ? mealBreakFullTitle : 'Enter work details...'}
                      value={entry.notes || ''}
                      onChange={(e) => handleFieldChange(slot, 'notes', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl px-3 py-2.5 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none hover:border-slate-300 transition-all shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* Status & Save Button (3 cols - completely separated and non-overlapping) */}
                  <div className="lg:col-span-3 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Status
                      </label>
                      <select
                        value={entry.status || 'Completed'}
                        disabled={!hasProjects}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'On Leave') {
                            handleMarkEntireDayOnLeave();
                          } else {
                            handleFieldChange(slot, 'status', newStatus);
                            if (newStatus === 'Lunch Break' || newStatus === 'Dinner Break') {
                              handleFieldChange(slot, 'notes', activeShift === 'night' ? 'Dinner Break' : 'Lunch Break');
                              handleFieldChange(slot, 'taskCount', 0);
                            }
                          }
                        }}
                        className={`w-full border text-[11px] font-bold rounded-2xl px-2.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed ${
                          isLeave
                            ? 'bg-rose-50 text-rose-700 border-rose-300 font-black'
                            : isMealBreak
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Completed">✓ Done</option>
                        <option value="In Progress">⏳ Progress</option>
                        <option value="Blocked">⚠️ Blocked</option>
                        <option value={activeShift === 'night' ? 'Dinner Break' : 'Lunch Break'}>{mealBreakLabel}</option>
                        <option value="On Leave">🏖️ Leave (All Day)</option>
                      </select>
                    </div>

                    {/* Save Button */}
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleSave(slot)}
                        disabled={isSaving || !hasProjects}
                        className={`flex items-center gap-1 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
                          !hasProjects
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : isDirty
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 ring-2 ring-amber-300 scale-105'
                            : isSaved
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                        title={!hasProjects ? 'Admin must add projects first' : isDirty ? 'Save changes' : isSaved ? 'Saved (click to update)' : 'Save log'}
                      >
                        {isSaving ? (
                          <span className="animate-spin text-xs">⏳</span>
                        ) : isSaved && !isDirty ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{isDirty ? 'Update' : 'Save'}</span>
                          </>
                        )}
                      </button>

                      {entry.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(slot)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-2xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
