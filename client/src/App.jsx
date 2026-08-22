import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { UnifiedAuth } from './components/Auth/EmployeeAuth.jsx';
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
  Flame
} from 'lucide-react';

const MainApp = () => {
  const { addToast } = useToast();

  // Unified Authenticated User (Saved in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lionix_user') || localStorage.getItem('taskpulse_employee') || localStorage.getItem('taskpulse_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Strict & Robust Admin Recognition
  const isAdmin = Boolean(
    currentUser && (
      currentUser.isAdmin === true ||
      currentUser.role === 'Administrator' ||
      (currentUser.email && currentUser.email.toLowerCase().includes('uthej')) ||
      (currentUser.name && currentUser.name.toLowerCase().includes('admin'))
    )
  );

  // Admin Active Tab
  const [currentAdminTab, setCurrentAdminTab] = useState('overview'); // 'overview' | 'hourly' | 'daily' | 'members' | 'projects'

  // Master Data & Global Settings
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dailyTaskGoal, setDailyTaskGoal] = useState(100);
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

  // Fetch Master Data & Global Goal
  const fetchMasterData = async () => {
    try {
      const [membersData, projectsData, settingsData] = await Promise.all([
        api.getMembers(),
        api.getProjects(),
        api.getSettings()
      ]);
      setMembers(membersData);
      setProjects(projectsData);
      if (settingsData?.dailyTaskGoal) {
        setDailyTaskGoal(settingsData.dailyTaskGoal);
      }
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  // Fetch Employee Logs
  const fetchEmployeeLogs = useCallback(async () => {
    if (!currentUser?.id || isAdmin || !selectedDate) return;
    try {
      const logs = await api.getHourlyLogs({
        memberId: currentUser.id,
        date: selectedDate
      });
      setEmployeeLogs(logs);
    } catch (err) {
      console.error('Error fetching employee logs:', err);
    }
  }, [currentUser?.id, isAdmin, selectedDate]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!isAdmin || !selectedDate) return;
    try {
      const [overviewData, matrixData, logsData, summaryData, settingsData] = await Promise.all([
        api.getAdminOverview({ date: selectedDate }),
        api.getMatrix(selectedDate),
        api.getHourlyLogs({ date: selectedDate }),
        api.getDailySummary({ date: selectedDate }),
        api.getSettings()
      ]);
      setAdminOverview(overviewData);
      setAdminMatrix(matrixData);
      setAdminHourlyLogs(logsData);
      setAdminDailySummaries(summaryData);
      if (settingsData?.dailyTaskGoal) {
        setDailyTaskGoal(settingsData.dailyTaskGoal);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }, [isAdmin, selectedDate]);

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
    if (currentUser && !isAdmin) {
      fetchEmployeeLogs();
    }
  }, [currentUser, isAdmin, selectedDate, fetchEmployeeLogs]);

  useEffect(() => {
    if (currentUser && isAdmin) {
      fetchAdminData();
    }
  }, [currentUser, isAdmin, selectedDate, fetchAdminData]);

  // Unified Login Handler
  const handleLoginSuccess = (user) => {
    const userIsAdmin = Boolean(
      user.isAdmin === true ||
      user.role === 'Administrator' ||
      (user.email && user.email.toLowerCase().includes('uthej')) ||
      (user.name && user.name.toLowerCase().includes('admin'))
    );

    const enrichedUser = {
      ...user,
      isAdmin: userIsAdmin
    };

    setCurrentUser(enrichedUser);
    localStorage.setItem('lionix_user', JSON.stringify(enrichedUser));
    
    if (userIsAdmin) {
      addToast(`Welcome to LionIX Admin Dashboard, ${enrichedUser.name}!`, 'success');
      setCurrentAdminTab('overview');
    } else {
      addToast(`Welcome to LionIX, ${enrichedUser.name}!`, 'success');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lionix_user');
    localStorage.removeItem('taskpulse_employee');
    localStorage.removeItem('taskpulse_admin');
    addToast('Signed out of LionIX', 'info');
  };

  // Task Logging Handlers (Employee)
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
      setCurrentUser(null);
      localStorage.removeItem('lionix_user');
      localStorage.removeItem('taskpulse_employee');
      localStorage.removeItem('taskpulse_admin');
      addToast('System reset: All accounts, projects, and logs cleared.', 'info');
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
        isAdminMode={isAdmin}
        adminUser={isAdmin ? currentUser : null}
        employeeUser={!isAdmin ? currentUser : null}
        currentAdminTab={currentAdminTab}
        onAdminTabChange={setCurrentAdminTab}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-500">Loading LionIX Workspace...</p>
          </div>
        ) : !currentUser ? (
          /* UNIFIED LOGIN PAGE */
          <UnifiedAuth onLoginSuccess={handleLoginSuccess} />
        ) : isAdmin ? (
          /* LIONIX ADMIN PORTAL & DASHBOARD */
          <div className="space-y-6">
            {/* Admin Tab Navigation on Mobile / Tablet */}
            <div className="flex lg:hidden items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
              <button
                onClick={() => setCurrentAdminTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  currentAdminTab === 'overview'
                    ? 'bg-amber-500 text-white shadow-sm'
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
                    ? 'bg-amber-500 text-white shadow-sm'
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
                    ? 'bg-amber-500 text-white shadow-sm'
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
                    ? 'bg-amber-500 text-white shadow-sm'
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
                    ? 'bg-amber-500 text-white shadow-sm'
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
                onRefresh={fetchAdminData}
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
        ) : (
          /* EMPLOYEE TASK TRACKER PORTAL */
          <div className="space-y-6">
            {/* Top Member Header & Date Selector */}
            <MemberSelector
              employeeUser={currentUser}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* 2-Column Work Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Hourly Task Grid */}
              <div className="lg:col-span-8">
                <HourlyTaskGrid
                  memberId={currentUser.id}
                  selectedDate={selectedDate}
                  projects={projects}
                  logs={employeeLogs}
                  dailyTaskGoal={dailyTaskGoal}
                  onSaveLog={handleSaveHourlyLog}
                  onDeleteLog={handleDeleteHourlyLog}
                />
              </div>

              {/* Right: Daily Summary & Velocity Stats */}
              <div className="lg:col-span-4 sticky top-24">
                <DailySummaryCard
                  member={currentUser}
                  selectedDate={selectedDate}
                  logs={employeeLogs}
                  dailyTaskGoal={dailyTaskGoal}
                />
              </div>
            </div>
          </div>
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
            Unified Portal • Role-Based Access Routing
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
