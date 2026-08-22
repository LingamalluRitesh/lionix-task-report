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
  FileText,
  Hash,
  Sparkles
} from 'lucide-react';

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

export const HourlyTaskGrid = ({
  memberId,
  selectedDate,
  projects = [],
  logs = [],
  dailyTaskGoal = 100,
  onSaveLog,
  onDeleteLog
}) => {
  const [formState, setFormState] = useState({});
  const [savingSlot, setSavingSlot] = useState(null);
  // Track input mode per slot: 'both' | 'text_only' | 'count_only'
  const [slotModes, setSlotModes] = useState({});

  useEffect(() => {
    const stateMap = {};
    const modesMap = {};

    STANDARD_HOURS.forEach(slot => {
      stateMap[slot] = {
        id: null,
        projectId: projects[0]?.id || '',
        projectName: projects[0]?.name || '',
        taskCount: 0,
        notes: '',
        status: 'Completed',
        isDirty: false,
        isSaved: false
      };
      modesMap[slot] = 'both';
    });

    logs.forEach(log => {
      if (STANDARD_HOURS.includes(log.hourSlot)) {
        stateMap[log.hourSlot] = {
          id: log.id,
          projectId: log.projectId || (projects[0]?.id || ''),
          projectName: log.projectName || (projects[0]?.name || ''),
          taskCount: log.taskCount || 0,
          notes: log.notes || '',
          status: log.status || 'Completed',
          isDirty: false,
          isSaved: true
        };
        // If they had notes but 0 taskCount, default to text focus
        if (log.notes && (!log.taskCount || log.taskCount === 0)) {
          modesMap[log.hourSlot] = 'text_only';
        }
      }
    });

    setFormState(stateMap);
    setSlotModes(modesMap);
  }, [logs, projects, memberId, selectedDate]);

  const toggleSlotMode = (slot) => {
    setSlotModes(prev => {
      const current = prev[slot] || 'both';
      const next = current === 'both' ? 'text_only' : current === 'text_only' ? 'count_only' : 'both';
      return { ...prev, [slot]: next };
    });
  };

  const handleFieldChange = (slot, field, value) => {
    setFormState(prev => {
      const current = prev[slot] || {
        projectId: projects[0]?.id || '',
        projectName: projects[0]?.name || '',
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

      // If typing in text notes and taskCount is 0, auto-estimate 1 task if not set
      if (field === 'notes' && value && value.trim().length > 0 && current.taskCount === 0) {
        // Look for numbers in the notes (e.g. "50 images done" -> 50)
        const match = value.match(/\b(\d+)\b/);
        if (match) {
          updated.taskCount = parseInt(match[1], 10);
        }
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

    // If task count is 0 but notes are provided, count it as 1 task session
    if (finalCount === 0 && data.notes && data.notes.trim().length > 0) {
      finalCount = 1;
    }

    setSavingSlot(slot);
    try {
      await onSaveLog({
        id: data.id,
        memberId,
        date: selectedDate,
        hourSlot: slot,
        projectId: data.projectId || projects[0]?.id,
        projectName: data.projectName || projects[0]?.name,
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

  const handleDelete = async (slot) => {
    const data = formState[slot];
    if (!data || !data.id) {
      setFormState(prev => ({
        ...prev,
        [slot]: {
          id: null,
          projectId: projects[0]?.id || '',
          projectName: projects[0]?.name || '',
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

  const hasProjects = projects.length > 0;

  // Calculate day completion progress
  const loggedCount = STANDARD_HOURS.filter(s => formState[s]?.isSaved && formState[s]?.id).length;
  const progressPercent = Math.round((loggedCount / STANDARD_HOURS.length) * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
      {/* Header & Day Progress Banner */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Hourly Task Session</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono">
                  Fixed 9:00 AM – 6:00 PM
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 font-mono">
                  <Target className="w-3 h-3" /> Goal: {dailyTaskGoal} tasks/day
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Log completed work: enter numeric counts (e.g. 210 tasks) and/or write work description text.
              </p>
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-700 flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-amber-600" />
              Day Progress: {loggedCount} of {STANDARD_HOURS.length} hours logged
            </span>
            <span className="font-mono text-amber-700">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
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

      {/* Fixed 9 AM to 6 PM Task Filling Cards */}
      <div className="mt-6 space-y-4">
        {STANDARD_HOURS.map((slot, index) => {
          const entry = formState[slot] || {
            taskCount: 0,
            projectId: projects[0]?.id || '',
            projectName: projects[0]?.name || '',
            notes: '',
            status: 'Completed',
            isDirty: false,
            isSaved: false
          };

          const mode = slotModes[slot] || 'both';
          const isSaved = entry.isSaved && !entry.isDirty && entry.id;
          const isDirty = entry.isDirty;
          const isSaving = savingSlot === slot;

          return (
            <div
              key={slot}
              className={`p-4 rounded-3xl border transition-all duration-200 ${
                isSaved
                  ? 'bg-emerald-50/30 border-emerald-200/80 shadow-xs hover:border-emerald-300'
                  : isDirty
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm ring-1 ring-amber-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-3.5">
                {/* 1. Time Slot Pill & Index */}
                <div className="lg:w-48 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100/70 text-amber-900 text-xs font-mono font-extrabold shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 font-mono tracking-tight block">
                        {slot}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" /> Logged & Saved
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
                </div>

                {/* 2. Project Selection */}
                <div className="lg:w-48 shrink-0">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 lg:hidden">
                    Assigned Project
                  </label>
                  <div className="relative">
                    <select
                      value={entry.projectId || ''}
                      onChange={(e) => handleFieldChange(slot, 'projectId', e.target.value)}
                      disabled={!hasProjects}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-2xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none appearance-none cursor-pointer pr-8 hover:border-slate-300 transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Flexible Work & Task Logger (Supports Number + Text) */}
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Task Count Box (Visible in 'both' and 'count_only' modes) */}
                  {mode !== 'text_only' && (
                    <div className="sm:w-32 shrink-0">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          disabled={!hasProjects}
                          placeholder="0"
                          value={entry.taskCount === 0 ? '' : entry.taskCount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                            handleFieldChange(slot, 'taskCount', val);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-extrabold rounded-2xl px-3 py-2.5 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none hover:border-slate-300 transition-all shadow-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed text-center"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 uppercase pointer-events-none">
                          Tasks
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Work Description / Text Input (Visible in 'both' and 'text_only' modes) */}
                  {mode !== 'count_only' && (
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        disabled={!hasProjects}
                        placeholder="Type work details / task description (e.g. Data Annotation, Bug fixes, API tests)..."
                        value={entry.notes || ''}
                        onChange={(e) => handleFieldChange(slot, 'notes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-2xl px-3.5 py-2.5 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none hover:border-slate-300 transition-all shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed font-medium"
                      />
                    </div>
                  )}

                  {/* Mode Toggle Button: Switch between [Both], [Text Only], [Count Only] */}
                  <button
                    type="button"
                    onClick={() => toggleSlotMode(slot)}
                    className="shrink-0 p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-slate-200/60 shadow-2xs"
                    title={
                      mode === 'both' 
                        ? 'Switch to Text Details only' 
                        : mode === 'text_only' 
                        ? 'Switch to Task Count only' 
                        : 'Switch to Count + Text view'
                    }
                  >
                    {mode === 'both' ? (
                      <span className="text-[10px] font-extrabold text-amber-700 px-1"># &amp; 📝</span>
                    ) : mode === 'text_only' ? (
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                </div>

                {/* 4. Status Selector & Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 lg:pt-0">
                  <select
                    value={entry.status || 'Completed'}
                    disabled={!hasProjects}
                    onChange={(e) => handleFieldChange(slot, 'status', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-[11px] font-bold rounded-2xl px-2.5 py-2.5 text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer shadow-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="Completed">✓ Done</option>
                    <option value="In Progress">⏳ In Progress</option>
                    <option value="Blocked">⚠️ Blocked</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSave(slot)}
                    disabled={isSaving || !hasProjects}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-xs cursor-pointer ${
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
          );
        })}
      </div>
    </div>
  );
};
