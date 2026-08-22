import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Mail, 
  Briefcase, 
  Lock, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck,
  Crown,
  Sparkles,
  Check
} from 'lucide-react';
import { api } from '../../services/api.js';

const AVATAR_COLORS = [
  '#0284c7', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#e11d48', '#4f46e5'
];

const PREDEFINED_ROLES = [
  'Team Lead',
  'Team Coordinator',
  'Python Developer',
  'SQL Developer',
  'Data Annotator',
  'Team Member'
];

export const MemberManager = ({
  members = [],
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  onResetAllData
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Lionixllp',
    role: 'Python Developer',
    department: 'IT',
    avatarColor: '#0284c7',
    active: true
  });

  // Team Assignments State
  const [assignments, setAssignments] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [selectedTeammateIds, setSelectedTeammateIds] = useState([]);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await api.getTeamAssignments();
      setAssignments(data || {});
    } catch (err) {
      console.error('Error fetching team assignments:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      password: 'Lionixllp',
      role: 'Python Developer',
      department: 'IT',
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setShowPassword(false);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      password: '',
      role: member.role || 'Python Developer',
      department: member.department || 'IT',
      avatarColor: member.avatarColor || '#0284c7',
      active: member.active !== undefined ? member.active : true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMember) {
      await onUpdateMember(editingMember.id, formData);
    } else {
      await onCreateMember({
        ...formData,
        password: formData.password || 'Lionixllp'
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove team member "${name}"?`)) {
      await onDeleteMember(id);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('WARNING: This will clear all employee accounts, projects, and logs for a completely clean start. Continue?')) {
      await onResetAllData();
    }
  };

  // Open Assign Teammates Modal
  const handleOpenAssignModal = (lead) => {
    setAssigningLead(lead);
    const current = assignments[lead.id] || [];
    setSelectedTeammateIds([...current]);
    setShowAssignModal(true);
  };

  const toggleTeammateSelection = (memberId) => {
    setSelectedTeammateIds(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!assigningLead) return;
    setIsSavingAssignments(true);
    try {
      await api.assignTeammates(assigningLead.id, selectedTeammateIds);
      await fetchAssignments();
      setShowAssignModal(false);
    } catch (err) {
      alert('Failed to save team assignments');
    } finally {
      setIsSavingAssignments(false);
    }
  };

  const leadsAndCoordinators = members.filter(m => {
    const r = (m.role || '').toLowerCase();
    return r.includes('lead') || r.includes('coordinator') || (assignments[m.id] && assignments[m.id].length > 0);
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Team Management &amp; Role Assignments</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Designate <strong>Team Leads</strong> and <strong>Team Coordinators</strong>, assign teammates for view-only progress tracking &amp; Excel downloads.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-xs cursor-pointer"
            title="Reset all users and data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clean Reset</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Quick Team Lead / Coordinator Assignment Summary Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-200/80 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Team Leads &amp; Coordinators Roster ({leadsAndCoordinators.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Leads &amp; Coordinators have <strong>view-only access</strong> to review workprogress &amp; download Excel for their assigned teammates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {leadsAndCoordinators.map(lead => {
              const count = (assignments[lead.id] || []).length;
              return (
                <button
                  key={lead.id}
                  onClick={() => handleOpenAssignModal(lead)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lead.avatarColor || '#d97706' }}></span>
                  <span>{lead.name.split(' ')[0]}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-md font-mono">
                    {count} teammates
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length > 0 ? (
          members.map((member) => {
            const roleLower = (member.role || '').toLowerCase();
            const isLead = roleLower.includes('lead') || roleLower.includes('coordinator');
            const assignedCount = (assignments[member.id] || []).length;

            return (
              <div
                key={member.id}
                className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isLead ? 'border-amber-300 ring-1 ring-amber-200/60 bg-amber-50/10' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs relative shrink-0"
                        style={{ backgroundColor: member.avatarColor || '#0284c7' }}
                      >
                        {member.name.charAt(0)}
                        {isLead && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                            👑
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{member.name}</span>
                        </h3>
                        <span className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-lg border mt-1 ${
                          isLead
                            ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {member.role || 'Python Developer'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Edit profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-800 font-bold">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.department || 'IT Department'}</span>
                    </div>
                  </div>
                </div>

                {/* Team Assignment Controls for Leads */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenAssignModal(member)}
                    className={`flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      isLead || assignedCount > 0
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{assignedCount > 0 ? `Assigned Teammates (${assignedCount})` : 'Assign Teammates'}</span>
                  </button>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    member.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {member.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400">
            No team members added yet.
          </div>
        )}
      </div>

      {/* Member Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingMember ? 'Edit Member Profile' : 'Add New Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ritesh Lingamallu"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Username</label>
                <input
                  type="text"
                  placeholder="e.g. ritesh@lionix.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role / Designation</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                >
                  {PREDEFINED_ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selecting <strong>Team Lead</strong> or <strong>Team Coordinator</strong> gives them view-only progress and Excel export access for their assigned team.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingMember ? 'Leave blank to keep unchanged' : 'Default: Lionixllp'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25"
                >
                  {editingMember ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TEAMMATES MODAL */}
      {showAssignModal && assigningLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Assign Teammates to {assigningLead.name}
                  </h3>
                  <span className="text-[11px] text-amber-700 font-bold">
                    {assigningLead.role} • IT Department
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select which employees report to <strong>{assigningLead.name}</strong>. {assigningLead.name} will have <strong>view-only access</strong> to inspect their hourly work progress and download their Excel work report.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200/80 rounded-2xl p-3 bg-slate-50">
              {members
                .filter(m => m.id !== assigningLead.id)
                .map(m => {
                  const isChecked = selectedTeammateIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      onClick={() => toggleTeammateSelection(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-50/80 border-amber-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                          style={{ backgroundColor: m.avatarColor || '#0284c7' }}
                        >
                          {m.name.charAt(0)}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.role} • {m.email}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </label>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                {selectedTeammateIds.length} teammates selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={isSavingAssignments}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSavingAssignments ? 'Saving...' : 'Save Team Assignments'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
