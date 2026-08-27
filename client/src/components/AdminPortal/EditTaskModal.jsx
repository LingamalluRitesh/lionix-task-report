import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';

export const EditTaskModal = ({
  isOpen,
  onClose,
  log,
  members = [],
  projects = [],
  onSave
}) => {
  if (!isOpen || !log) return null;

  const [formData, setFormData] = useState({
    memberId: log.memberId || '',
    projectId: log.projectId || '',
    projectName: log.projectName || '',
    date: log.date || '',
    hourSlot: log.hourSlot || '',
    taskCount: log.taskCount || 0,
    notes: log.notes || '',
    status: log.status || 'Completed'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (log) {
      setFormData({
        memberId: log.memberId || '',
        projectId: log.projectId || '',
        projectName: log.projectName || '',
        date: log.date || '',
        hourSlot: log.hourSlot || '',
        taskCount: log.taskCount || 0,
        notes: log.notes || '',
        status: log.status || 'Completed'
      });
    }
  }, [log]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'projectId') {
        const proj = projects.find(p => p.id === value);
        if (proj) updated.projectName = proj.name;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(log.id, {
        ...formData,
        taskCount: Math.max(0, parseInt(formData.taskCount, 10) || 0)
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Edit Task Entry</h3>
              <p className="text-xs text-slate-500">Modify tasks count, project assignment, or notes.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Team Member
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => handleChange('memberId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Hour Slot & Task Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Hour Slot
              </label>
              <input
                type="text"
                required
                value={formData.hourSlot}
                onChange={(e) => handleChange('hourSlot', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                No. of Tasks Done
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.taskCount}
                onChange={(e) => handleChange('taskCount', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono font-extrabold text-sm rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Project Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Project Name
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code || 'PROJ'})</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Task Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                handleChange('status', newStatus);
                if (newStatus === 'On Leave' && !formData.notes) {
                  handleChange('notes', 'On Leave');
                  handleChange('taskCount', 0);
                } else if (newStatus === 'Lunch Break' && !formData.notes) {
                  handleChange('notes', 'Lunch Break');
                  handleChange('taskCount', 0);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
            >
              <option value="Completed">✓ Completed / Done</option>
              <option value="In Progress">⏳ In Progress</option>
              <option value="Blocked">⚠️ Blocked</option>
              <option value="Lunch Break">🍱 Lunch Break</option>
              <option value="On Leave">🏖️ On Leave</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Work Notes & Details
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="What was completed during this hour?"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
