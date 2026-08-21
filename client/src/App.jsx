import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { EmployeeAuth } from './components/Auth/EmployeeAuth.jsx';
import { AdminAuth } from './components/Auth/AdminAuth.jsx';
import { MemberSelector } from './components/MemberPortal/MemberSelector.jsx';
import { HourlyTaskGrid } from './components/MemberPortal/HourlyTaskGrid.jsx';
import { DailySummaryCard } from './components/MemberPortal/DailySummaryCard.jsx';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard.jsx';
import { HourlyWorkReport } from './components/AdminPortal/HourlyWorkReport.jsx';
import { DailyWorkReport } from './components/AdminPortal/DailyWorkReport.jsx';
import { MemberManager } from './components/AdminPortal/MemberManager.jsx';
import { ProjectManager } from './components/AdminPortal/ProjectManager.jsx';
import { EditTaskModal } from './components/AdminPortal/EditTaskModal.jsx';
import { ToastProvider, useToast } from './components/UI/Toast.jsx';
import { api } from './services/api.js';
import { 
  Activity, 
  Clock, 
  BarChart3, 
  Users, 
  FolderKanban, 
  ShieldCheck,
  Flame
} from 'lucide-react';

const MainApp = () => {
  const { addToast } = useToast();

  // URL Path Detection (Admin mode is accessible ONLY via /admin or #/admin or ?portal=admin)
  const [isAdminMode, setIsAdminMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.includes('/admin') || hash.includes('admin') || search.includes('portal=admin');
  });

  // Listen for browser navigation changes
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminMode(path.includes('/admin') || hash.includes('admin') || search.includes('portal=admin'));
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  // Auth Sessions (Stored in localStorage)
  const [employeeUser, setEmployeeUser] = useState(() => {
    try {
      const saved = localStorage.getItem('taskpulse_employee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('taskpulse_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Active Tab
  const [currentAdminTab, setCurrentAdminTab] = useState('overview'); // 'overview' | 'hourly' | 'daily' | 'members' | 'projects'

  // Master Data
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Date
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data for Employee View
  const [employeeLogs, setEmployeeLogs] = useState([]);

  // Data for Admin View
  const [adminOverview, setAdminOverview] = useState({});
  const [adminMatrix, setAdminMatrix] = useState({ allHours: [], matrix: [] });
  const [adminHourlyLogs, setAdminHourlyLogs] = useState([]);
  const [adminDailySummaries, setAdminDailySummaries] = useState([]);

  // Edit Modal State
  const [editingLog, setEditingLog] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Master Data
  const fetchMasterData = async () => {
    try {
      const [membersData, projectsData] = await Promise.all([
        api.getMembers(),
        api.getProjects()
      ]);
      setMembers(membersData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  // Fetch Employee Logs
  const fetchEmployeeLogs = useCallback(async () => {
    if (!employeeUser?.id || !selectedDate) return;
    try {
      const logs = await api.getHourlyLogs({
        memberId: employeeUser.id,
        date: selectedDate
      });
      setEmployeeLogs(logs);
    } catch (err) {
      console.error('Error fetching employee logs:', err);
    }
  }, [employeeUser?.id, selectedDate]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!isAdminMode || !adminUser || !selectedDate) return;
    try {
      const [overviewData, matrixData, logsData, summaryData] = await Promise.all([
        api.getAdminOverview({ date: selectedDate }),
        api.getMatrix(selectedDate),
        api.getHourlyLogs({ date: selectedDate }),
        api.getDailySummary({ date: selectedDate })
      ]);
      setAdminOverview(overviewData);
      setAdminMatrix(matrixData);
      setAdminHourlyLogs(logsData);
      setAdminDailySummaries(summaryData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [isAdminMode, adminUser, selectedDate]);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMasterData();
      setLoading(false);
    };
    init();
  }, []);

  // Sync on state updates
  useEffect(() => {
    if (employeeUser?.id) {
      fetchEmployeeLogs();
    }
  }, [employeeUser?.id, selectedDate, fetchEmployeeLogs]);

  useEffect(() => {
    if (isAdminMode && adminUser) {
      fetchAdminData();
    }
  }, [isAdminMode, adminUser, selectedDate, fetchAdminData]);

  // Employee Auth Handlers
  const handleEmployeeLoginSuccess = (user) => {
    setEmployeeUser(user);
    localStorage.setItem('taskpulse_employee', JSON.stringify(user));
    addToast(`Welcome to LionIX, ${user.name}!`, 'success');
  };

  const handleEmployeeLogout = () => {
    setEmployeeUser(null);
    localStorage.removeItem('taskpulse_employee');
    addToast('Signed out of LionIX employee portal', 'info');
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    localStorage.setItem('taskpulse_admin', JSON.stringify(user));
    addToast('Welcome to the LionIX Admin Portal', 'success');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('taskpulse_admin');
    window.location.href = '/';
  };

  // Task Logging Handlers
  const handleSaveHourlyLog = async (logData) => {
    try {
      await api.saveHourlyLog(logData);
      addToast(`Hourly task saved for ${logData.hourSlot}`, 'success');
      await Promise.all([fetchEmployeeLogs(), fetchAdminData()]);
    } catch (err) {
      addToast('Failed to save hourly task log', 'error');
    }
  };

  const handleUpdateHourlyLog = async (id, updates) => {
    try {
      await api.updateHourlyLog(id, updates);
      addToast('Task record updated', 'success');
      await Promise.all([fetchEmployeeLogs(), fetchAdminData()]);
    } catch (err) {
      addToast('Failed to update log', 'error');
    }
  };

  const handleDeleteHourlyLog = async (id) => {
    try {
      await api.deleteHourlyLog(id);
      addToast('Hourly task log removed', 'info');
      await Promise.all([fetchEmployeeLogs(), fetchAdminData()]);
    } catch (err) {
      addToast('Failed to delete log', 'error');
    }
  };

  const handleOpenEditLog = (log) => {
    setEditingLog(log);
    setIsEditModalOpen(true);
  };

  const handleAddNewLogForMember = (memberId, hourSlot) => {
    setEditingLog({
      id: null,
      memberId,
      projectId: projects[0]?.id || '',
      date: selectedDate,
      hourSlot,
      taskCount: 1,
      notes: '',
      status: 'Completed'
    });
    setIsEditModalOpen(true);
  };

  // Admin Management Handlers
  const handleCreateMember = async (memberData) => {
    try {
      const res = await api.createMember(memberData);
      if (res.success) {
        addToast(`Member account created for ${memberData.name}`, 'success');
        await fetchMasterData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to add member', 'error');
    }
  };

  const handleUpdateMember = async (id, memberData) => {
    try {
      await api.updateMember(id, memberData);
      addToast('Member updated', 'success');
      await fetchMasterData();
    } catch (err) {
      addToast('Failed to update member', 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await api.deleteMember(id);
      addToast('Member account removed', 'info');
      await fetchMasterData();
      await fetchAdminData();
    } catch (err) {
      addToast('Failed to remove member', 'error');
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const res = await api.createProject(projectData);
      if (res.success) {
        addToast(`Project "${projectData.name}" created`, 'success');
        await fetchMasterData();
      }
    } catch (err) {
      addToast('Failed to create project', 'error');
    }
  };

  const handleUpdateProject = async (id, projectData) => {
    try {
      await api.updateProject(id, projectData);
      addToast('Project updated', 'success');
      await fetchMasterData();
    } catch (err) {
      addToast('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      addToast('Project deleted', 'info');
      await fetchMasterData();
    } catch (err) {
      addToast('Failed to delete project', 'error');
    }
  };

  const handleResetAllData = async () => {
    try {
      await api.resetData();
      setEmployeeUser(null);
      localStorage.removeItem('taskpulse_employee');
      addToast('System reset: All employees, projects, and logs cleared.', 'info');
      await fetchMasterData();
      await fetchAdminData();
    } catch (err) {
      addToast('Failed to reset data', 'error');
    }
  };

  const handleExportCsv = (type) => {
    const url = api.getExportCsvUrl({
      type,
      date: selectedDate
    });
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        isAdminMode={isAdminMode}
        adminUser={adminUser}
        employeeUser={employeeUser}
        currentAdminTab={currentAdminTab}
        onAdminTabChange={setCurrentAdminTab}
        onLogout={isAdminMode ? handleAdminLogout : handleEmployeeLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500">Loading LionIX Task Workspace...</p>
          </div>
        ) : (
          <>
            {/* SCENARIO 1: ADMIN MODE (URL /admin) */}
            {isAdminMode ? (
              !adminUser ? (
                // 1A. Admin Login Screen
                <AdminAuth onAdminLoginSuccess={handleAdminLoginSuccess} />
              ) : (
                // 1B. Full Admin Portal
                <div className="space-y-6">
                  {/* Admin Tab Navigation on Mobile / Tablet */}
                  <div className="flex lg:hidden items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
                    <button
                      onClick={() => setCurrentAdminTab('overview')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        currentAdminTab === 'overview'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      <span>Overview</span>
                    </button>
                    <button
                      onClick={() => setCurrentAdminTab('hourly')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        currentAdminTab === 'hourly'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Hourly Report</span>
                    </button>
                    <button
                      onClick={() => setCurrentAdminTab('daily')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        currentAdminTab === 'daily'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Daily Report</span>
                    </button>
                    <button
                      onClick={() => setCurrentAdminTab('members')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        currentAdminTab === 'members'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Team</span>
                    </button>
                    <button
                      onClick={() => setCurrentAdminTab('projects')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        currentAdminTab === 'projects'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FolderKanban className="w-4 h-4" />
                      <span>Projects</span>
                    </button>
                  </div>

                  {/* Admin Tab Content */}
                  {currentAdminTab === 'overview' && (
                    <AdminDashboard
                      overview={adminOverview}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onNavigateTab={setCurrentAdminTab}
                    />
                  )}

                  {currentAdminTab === 'hourly' && (
                    <HourlyWorkReport
                      matrixData={adminMatrix}
                      hourlyLogs={adminHourlyLogs}
                      members={members}
                      projects={projects}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onEditLog={handleOpenEditLog}
                      onDeleteLog={handleDeleteHourlyLog}
                      onAddNewLog={handleAddNewLogForMember}
                      onRefresh={fetchAdminData}
                      onExportCsv={handleExportCsv}
                    />
                  )}

                  {currentAdminTab === 'daily' && (
                    <DailyWorkReport
                      summaries={adminDailySummaries}
                      members={members}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onRefresh={fetchAdminData}
                      onExportCsv={handleExportCsv}
                    />
                  )}

                  {currentAdminTab === 'members' && (
                    <MemberManager
                      members={members}
                      onCreateMember={handleCreateMember}
                      onUpdateMember={handleUpdateMember}
                      onDeleteMember={handleDeleteMember}
                      onResetAllData={handleResetAllData}
                    />
                  )}

                  {currentAdminTab === 'projects' && (
                    <ProjectManager
                      projects={projects}
                      onCreateProject={handleCreateProject}
                      onUpdateProject={handleUpdateProject}
                      onDeleteProject={handleDeleteProject}
                    />
                  )}
                </div>
              )
            ) : (
              /* SCENARIO 2: EMPLOYEE PORTAL (Default /) */
              !employeeUser ? (
                // 2A. Employee Login & Signup Screen
                <EmployeeAuth
                  onLoginSuccess={handleEmployeeLoginSuccess}
                  projects={projects}
                />
              ) : (
                // 2B. Employee Task Logger Workspace
                <div className="space-y-6">
                  {/* Top Member Header & Date Selector */}
                  <MemberSelector
                    employeeUser={employeeUser}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                  />

                  {/* 2-Column Work Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Hourly Task Grid */}
                    <div className="lg:col-span-8">
                      <HourlyTaskGrid
                        memberId={employeeUser.id}
                        selectedDate={selectedDate}
                        projects={projects}
                        logs={employeeLogs}
                        onSaveLog={handleSaveHourlyLog}
                        onDeleteLog={handleDeleteHourlyLog}
                      />
                    </div>

                    {/* Right: Daily Summary & Velocity Stats */}
                    <div className="lg:col-span-4 sticky top-24">
                      <DailySummaryCard
                        member={employeeUser}
                        selectedDate={selectedDate}
                        logs={employeeLogs}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Global Edit Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        log={editingLog}
        members={members}
        projects={projects}
        onSave={async (id, data) => {
          if (id) {
            await handleUpdateHourlyLog(id, data);
          } else {
            await handleSaveHourlyLog(data);
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-bold text-slate-800">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>LionIX Task Report — 9:00 AM to 6:00 PM Enterprise Work Tracking</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Protected Employee Workspace • URL-Restricted Admin Access (/admin)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
