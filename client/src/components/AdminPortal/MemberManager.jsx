import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, X, Mail, Briefcase, Lock, RotateCcw, Eye, EyeOff } from 'lucide-react';

const AVATAR_COLORS = [
  '#0284c7', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2', '#e11d48', '#4f46e5'
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
    role: '',
    department: 'IT',
    avatarColor: '#0284c7',
    active: true
  });

  const handleOpenAdd = () => {
    setEditingMember(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      password: 'Lionixllp',
      role: '',
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
      role: member.role || '',
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">IT Team Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create employee accounts, manage login passwords (default: <code className="text-amber-800 font-bold font-mono">Lionixllp</code>), and assign roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-xs"
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
            <span>Add Member Account</span>
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xs"
                      style={{ backgroundColor: member.avatarColor || '#0284c7' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{member.name}</h3>
                      <p className="text-xs text-amber-700 font-bold">{member.role || 'Team Member'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-xs"
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, member.name)}
                      className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-600 transition-colors border border-slate-200 shadow-xs"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate font-medium text-slate-700">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                      {member.department || 'IT'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {member.id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl p-6">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No IT team members registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "+ Add Member Account" above to create employee accounts.</p>
          </div>
        )}
      </div>

      {/* Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingMember ? 'Edit IT Member' : 'Create IT Member Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jordan Smith"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. jordan.smith@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Login Password {editingMember ? '(Leave empty to keep current)' : '(Default: Lionixllp)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingMember ? '••••••••' : 'Lionixllp'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Job Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-900"
                  >
                    <option value="IT">IT</option>
                    <option value="IT - Software Development">IT - Software Development</option>
                    <option value="IT - Quality Assurance">IT - Quality Assurance</option>
                    <option value="IT - Infrastructure & Cloud">IT - Infrastructure & Cloud</option>
                    <option value="IT - Cyber Security">IT - Cyber Security</option>
                    <option value="IT - Data & Analytics">IT - Data & Analytics</option>
                    <option value="IT - Support & Operations">IT - Support & Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Avatar Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarColor: color })}
                      className={`w-7 h-7 rounded-xl transition-transform ${
                        formData.avatarColor === color ? 'scale-125 ring-2 ring-amber-500 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  {editingMember ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
