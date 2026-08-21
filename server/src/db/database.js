import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

class Database {
  constructor() {
    this.data = {
      admin: null,
      members: [],
      projects: [],
      hourlyLogs: [],
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure admin configuration is up to date
        if (!this.data.admin || this.data.admin.email !== 'uthej.lionix.com') {
          this.initAdmin();
          this.save();
        }
      } else {
        this.seedFreshData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB, initializing fresh:', err);
      this.seedFreshData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  initAdmin() {
    this.data.admin = {
      id: 'admin_root',
      name: 'Uthej (Admin)',
      email: 'uthej.lionix.com',
      password: 'Uthej@2003',
      role: 'Administrator',
      department: 'IT',
      avatarColor: '#f59e0b',
      createdAt: new Date().toISOString()
    };
  }

  seedFreshData() {
    this.initAdmin();
    this.data.projects = [];
    this.data.members = [];
    this.data.hourlyLogs = [];
  }

  resetData() {
    this.seedFreshData();
    this.save();
  }

  // --- Unified Login Validation (Admin & Employees) ---
  validateLogin(identifier, password) {
    if (!this.data.admin) this.initAdmin();
    
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check Admin (supports uthej.lionix.com and uthej@lionix.com)
    const adminEmail = (this.data.admin.email || '').toLowerCase();
    if (
      (cleanId === adminEmail || cleanId === 'uthej@lionix.com' || cleanId === 'uthej') &&
      this.data.admin.password === cleanPass
    ) {
      return {
        id: this.data.admin.id,
        name: this.data.admin.name,
        email: this.data.admin.email,
        role: this.data.admin.role,
        department: this.data.admin.department || 'IT',
        avatarColor: this.data.admin.avatarColor || '#f59e0b',
        isAdmin: true
      };
    }

    // Check Employees
    const member = this.data.members.find(
      m => (m.email.toLowerCase() === cleanId || m.name.toLowerCase() === cleanId) && m.active
    );

    if (member && member.password === cleanPass) {
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department || 'IT',
        avatarColor: member.avatarColor || '#0284c7',
        isAdmin: false
      };
    }

    return null;
  }

  // --- Members CRUD ---
  getMembers(filterActive = false) {
    if (filterActive) {
      return this.data.members.filter(m => m.active).map(this.sanitizeMember);
    }
    return this.data.members.map(this.sanitizeMember);
  }

  getMemberById(id) {
    const mem = this.data.members.find(m => m.id === id);
    return mem ? this.sanitizeMember(mem) : null;
  }

  sanitizeMember(member) {
    const { password, ...safe } = member;
    return safe;
  }

  addMember(member) {
    const cleanEmail = (member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@company.com`).trim().toLowerCase();
    
    const existing = this.data.members.find(m => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: member.name.trim(),
      email: cleanEmail,
      password: member.password || 'password123',
      role: member.role || 'Team Member',
      department: member.department || 'IT',
      avatarColor: member.avatarColor || '#0284c7',
      active: member.active !== undefined ? member.active : true,
      createdAt: new Date().toISOString()
    };
    this.data.members.push(newMember);
    this.save();
    return this.sanitizeMember(newMember);
  }

  updateMember(id, updates) {
    const index = this.data.members.findIndex(m => m.id === id);
    if (index === -1) return null;

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const existing = this.data.members.find(m => m.email.toLowerCase() === cleanEmail && m.id !== id);
      if (existing) throw new Error('Email is already in use by another member.');
      updates.email = cleanEmail;
    }

    this.data.members[index] = { ...this.data.members[index], ...updates };
    this.save();
    return this.sanitizeMember(this.data.members[index]);
  }

  deleteMember(id) {
    const index = this.data.members.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.data.members.splice(index, 1);
    this.data.hourlyLogs = this.data.hourlyLogs.filter(l => l.memberId !== id);
    this.save();
    return true;
  }

  // --- Projects CRUD (Admin-only creation) ---
  getProjects(filterActive = false) {
    if (filterActive) {
      return this.data.projects.filter(p => p.status === 'Active');
    }
    return this.data.projects;
  }

  getProjectById(id) {
    return this.data.projects.find(p => p.id === id);
  }

  addProject(project) {
    const newProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: project.name.trim(),
      code: (project.code || project.name.substring(0, 3)).toUpperCase(),
      description: project.description || '',
      color: project.color || '#0284c7',
      status: project.status || 'Active',
      createdAt: new Date().toISOString()
    };
    this.data.projects.push(newProject);
    this.save();
    return newProject;
  }

  updateProject(id, updates) {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.projects[index] = { ...this.data.projects[index], ...updates };
    this.save();
    return this.data.projects[index];
  }

  deleteProject(id) {
    const index = this.data.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.projects.splice(index, 1);
    this.save();
    return true;
  }

  // --- Hourly Logs CRUD & Reporting ---
  getHourlyLogs({ date, memberId, projectId, startDate, endDate }) {
    let logs = [...this.data.hourlyLogs];

    if (date) {
      logs = logs.filter(l => l.date === date);
    }
    if (startDate && endDate) {
      logs = logs.filter(l => l.date >= startDate && l.date <= endDate);
    } else if (startDate) {
      logs = logs.filter(l => l.date >= startDate);
    } else if (endDate) {
      logs = logs.filter(l => l.date <= endDate);
    }

    if (memberId) {
      logs = logs.filter(l => l.memberId === memberId);
    }
    if (projectId) {
      logs = logs.filter(l => l.projectId === projectId);
    }

    return logs.map(log => {
      const member = this.data.members.find(m => m.id === log.memberId);
      const project = this.getProjectById(log.projectId);
      return {
        ...log,
        memberName: member ? member.name : (log.memberId === 'admin_root' ? 'Uthej (Admin)' : 'Unknown Member'),
        memberRole: member ? member.role : 'Team Member',
        memberDepartment: member ? (member.department || 'IT') : 'IT',
        memberColor: member ? member.avatarColor : '#64748b',
        projectName: project ? project.name : (log.projectName || 'Unassigned'),
        projectCode: project ? project.code : 'GEN',
        projectColor: project ? project.color : '#64748b'
      };
    });
  }

  getHourlyLogById(id) {
    const log = this.data.hourlyLogs.find(l => l.id === id);
    if (!log) return null;
    const member = this.data.members.find(m => m.id === log.memberId);
    const project = this.getProjectById(log.projectId);
    return {
      ...log,
      memberName: member ? member.name : 'Unknown Member',
      memberDepartment: member ? (member.department || 'IT') : 'IT',
      projectName: project ? project.name : (log.projectName || 'Unassigned')
    };
  }

  createOrUpdateHourlyLog({ memberId, projectId, projectName, date, hourSlot, taskCount, notes, status }) {
    const existingIndex = this.data.hourlyLogs.findIndex(
      l => l.memberId === memberId && l.date === date && l.hourSlot === hourSlot
    );

    let proj = null;
    if (projectId) {
      proj = this.getProjectById(projectId);
    } else if (projectName) {
      proj = this.data.projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
    }

    if (!proj && this.data.projects.length > 0) {
      proj = this.data.projects[0];
    }

    const resolvedProjectId = proj ? proj.id : 'unassigned';
    const resolvedProjectName = proj ? proj.name : 'Unassigned';
    const cleanTaskCount = Math.max(0, parseInt(taskCount, 10) || 0);

    if (existingIndex !== -1) {
      this.data.hourlyLogs[existingIndex] = {
        ...this.data.hourlyLogs[existingIndex],
        projectId: resolvedProjectId,
        projectName: resolvedProjectName,
        taskCount: cleanTaskCount,
        notes: notes !== undefined ? notes : this.data.hourlyLogs[existingIndex].notes,
        status: status || this.data.hourlyLogs[existingIndex].status || 'Completed',
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.getHourlyLogById(this.data.hourlyLogs[existingIndex].id);
    } else {
      const newLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        memberId,
        projectId: resolvedProjectId,
        projectName: resolvedProjectName,
        date,
        hourSlot,
        taskCount: cleanTaskCount,
        notes: notes || '',
        status: status || 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.hourlyLogs.push(newLog);
      this.save();
      return this.getHourlyLogById(newLog.id);
    }
  }

  updateHourlyLog(id, updates) {
    const index = this.data.hourlyLogs.findIndex(l => l.id === id);
    if (index === -1) return null;

    if (updates.projectId) {
      const proj = this.getProjectById(updates.projectId);
      if (proj) updates.projectName = proj.name;
    } else if (updates.projectName) {
      const proj = this.data.projects.find(p => p.name.toLowerCase() === updates.projectName.toLowerCase());
      if (proj) updates.projectId = proj.id;
    }

    if (updates.taskCount !== undefined) {
      updates.taskCount = Math.max(0, parseInt(updates.taskCount, 10) || 0);
    }

    this.data.hourlyLogs[index] = {
      ...this.data.hourlyLogs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.getHourlyLogById(id);
  }

  deleteHourlyLog(id) {
    const index = this.data.hourlyLogs.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.data.hourlyLogs.splice(index, 1);
    this.save();
    return true;
  }

  // --- Aggregations & Daily Summaries ---
  getDailySummary({ date, startDate, endDate, memberId }) {
    const logs = this.getHourlyLogs({ date, startDate, endDate, memberId });
    const members = this.data.members;

    const summaryMap = {};

    logs.forEach(log => {
      const key = `${log.date}_${log.memberId}`;
      if (!summaryMap[key]) {
        const member = members.find(m => m.id === log.memberId) || { name: 'Unknown', role: '', department: 'IT', avatarColor: '#64748b' };
        summaryMap[key] = {
          date: log.date,
          memberId: log.memberId,
          memberName: member.name,
          memberRole: member.role,
          memberDepartment: member.department || 'IT',
          memberColor: member.avatarColor,
          totalTasks: 0,
          hoursWorked: 0,
          projectBreakdown: {},
          hourlySlotsLogged: [],
          logs: []
        };
      }

      summaryMap[key].totalTasks += Number(log.taskCount) || 0;
      summaryMap[key].hoursWorked += 1;
      summaryMap[key].hourlySlotsLogged.push(log.hourSlot);
      summaryMap[key].logs.push(log);

      const projName = log.projectName || 'Unassigned';
      if (!summaryMap[key].projectBreakdown[projName]) {
        summaryMap[key].projectBreakdown[projName] = {
          tasks: 0,
          color: log.projectColor || '#0284c7',
          projectId: log.projectId
        };
      }
      summaryMap[key].projectBreakdown[projName].tasks += Number(log.taskCount) || 0;
    });

    const summaries = Object.values(summaryMap).map(item => ({
      ...item,
      avgTasksPerHour: item.hoursWorked > 0 ? (item.totalTasks / item.hoursWorked).toFixed(1) : '0.0',
      projectsList: Object.entries(item.projectBreakdown).map(([name, data]) => ({
        projectName: name,
        tasks: data.tasks,
        color: data.color
      }))
    }));

    return summaries.sort((a, b) => b.totalTasks - a.totalTasks);
  }

  getAdminOverview({ date, startDate, endDate }) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logs = this.getHourlyLogs({ date: targetDate, startDate, endDate });
    const allMembers = this.data.members;
    const allProjects = this.getProjects();

    const totalTasksToday = logs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);
    const activeMemberIds = new Set(logs.map(l => l.memberId));
    const totalHoursLogged = logs.length;
    const avgTasksPerHour = totalHoursLogged > 0 ? (totalTasksToday / totalHoursLogged).toFixed(1) : '0.0';

    const projectTaskMap = {};
    logs.forEach(l => {
      const pName = l.projectName || 'General';
      projectTaskMap[pName] = (projectTaskMap[pName] || 0) + (Number(l.taskCount) || 0);
    });

    const projectDistribution = Object.entries(projectTaskMap).map(([name, tasks]) => {
      const proj = allProjects.find(p => p.name === name);
      return {
        name,
        tasks,
        color: proj ? proj.color : '#0284c7'
      };
    }).sort((a, b) => b.tasks - a.tasks);

    const hourlyVelocityMap = {};
    logs.forEach(l => {
      hourlyVelocityMap[l.hourSlot] = (hourlyVelocityMap[l.hourSlot] || 0) + (Number(l.taskCount) || 0);
    });

    const hourlyVelocity = Object.entries(hourlyVelocityMap).map(([slot, tasks]) => ({
      hourSlot: slot,
      tasks
    })).sort((a, b) => a.hourSlot.localeCompare(b.hourSlot));

    const memberLeaderboardMap = {};
    logs.forEach(l => {
      if (!memberLeaderboardMap[l.memberId]) {
        const mem = allMembers.find(m => m.id === l.memberId);
        memberLeaderboardMap[l.memberId] = {
          id: l.memberId,
          name: mem ? mem.name : 'Unknown',
          role: mem ? mem.role : '',
          department: mem ? (mem.department || 'IT') : 'IT',
          avatarColor: mem ? mem.avatarColor : '#64748b',
          totalTasks: 0,
          hoursLogged: 0
        };
      }
      memberLeaderboardMap[l.memberId].totalTasks += Number(l.taskCount) || 0;
      memberLeaderboardMap[l.memberId].hoursLogged += 1;
    });

    const memberLeaderboard = Object.values(memberLeaderboardMap)
      .map(m => ({
        ...m,
        avgRate: m.hoursLogged > 0 ? (m.totalTasks / m.hoursLogged).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.totalTasks - a.totalTasks);

    return {
      date: targetDate,
      totalTasksToday,
      totalMembers: allMembers.length,
      activeMembersCount: activeMemberIds.size,
      totalHoursLogged,
      avgTasksPerHour,
      topProject: projectDistribution.length > 0 ? projectDistribution[0].name : 'None',
      projectDistribution,
      hourlyVelocity,
      memberLeaderboard
    };
  }
}

export const db = new Database();
