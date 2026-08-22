import React, { useState } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

const PROJECT_COLORS = [
  '#0284c7', '#059669', '#7c3aed', '#d97706', '#e11d48', '#0891b2', '#db2777', '#4f46e5'
];

export const ProjectManager = ({
  projects = [],
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#0284c7',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      code: project.code || '',
      description: project.description || '',
      color: project.color || '#0284c7',
      status: project.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProject) {
      await onUpdateProject(editingProject.id, formData);
    } else {
      await onCreateProject(formData);
    }
    setShowModal(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      await onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Project Catalog</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Projects that team members select when logging their hourly task counts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-white text-xs shadow-xs"
                    style={{ backgroundColor: project.color || '#0284c7' }}
                  >
                    {project.code || project.name.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{project.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                      {project.code || 'PROJ'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-xs"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-600 transition-colors border border-slate-200 shadow-xs"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-600 line-clamp-2">
                  {project.description || <span className="italic text-slate-400">No description provided.</span>}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                <CheckCircle2 className="w-3 h-3" /> {project.status || 'Active'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ID: {project.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
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
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apollo Portal Redesign"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Project Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. APL-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Planned">Planned</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the project deliverables..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {PROJECT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-7 h-7 rounded-xl transition-transform ${
                        formData.color === color ? 'scale-125 ring-2 ring-indigo-600 ring-offset-2' : 'hover:scale-110'
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
