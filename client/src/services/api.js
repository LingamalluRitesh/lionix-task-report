const API_BASE = '/api';

export const api = {
  // Auth
  async login(identifier, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async changePassword(memberId, currentPassword, newPassword) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, currentPassword, newPassword })
    });
    return res.json();
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/auth/reset`, {
      method: 'POST'
    });
    return res.json();
  },

  // Settings (Daily Task Goal)
  async getSettings() {
    const res = await fetch(`${API_BASE}/reports/settings`);
    const json = await res.json();
    return json.data || { dailyTaskGoal: 100 };
  },

  async updateSettings(settings) {
    const res = await fetch(`${API_BASE}/reports/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Members
  async getMembers(activeOnly = false) {
    const res = await fetch(`${API_BASE}/members${activeOnly ? '?active=true' : ''}`);
    const json = await res.json();
    return json.data || [];
  },

  async createMember(member) {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return res.json();
  },

  async updateMember(id, updates) {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteMember(id) {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async assignMemberProject(memberId, projectId, projectName = '') {
    const res = await fetch(`${API_BASE}/members/${memberId}/assign-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, projectName })
    });
    return res.json();
  },

  async setMemberShift(memberId, date, shift) {
    const res = await fetch(`${API_BASE}/members/${memberId}/shift`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift })
    });
    return res.json();
  },

  // Team Assignments for Leads & Coordinators
  async getTeamAssignments() {
    const res = await fetch(`${API_BASE}/members/assignments`);
    const json = await res.json();
    return json.data || {};
  },

  async getLeadAssignments(leadId) {
    const res = await fetch(`${API_BASE}/members/${leadId}/assignments`);
    const json = await res.json();
    return json.data || [];
  },

  async assignTeammates(leadId, memberIds) {
    const res = await fetch(`${API_BASE}/members/${leadId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberIds })
    });
    return res.json();
  },

  // Projects
  async getProjects(activeOnly = false) {
    const res = await fetch(`${API_BASE}/projects${activeOnly ? '?active=true' : ''}`);
    const json = await res.json();
    return json.data || [];
  },

  async createProject(project) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return res.json();
  },

  async updateProject(id, updates) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async markMemberDayOnLeave(memberId, date, shift = 'morning') {
    const res = await fetch(`${API_BASE}/reports/member-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, date, shift })
    });
    return res.json();
  },

  // Reports
  async getHourlyLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/hourly?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getMatrix(date, leadId = '', shift = '') {
    const params = new URLSearchParams();
    const dateVal = typeof date === 'object' && date !== null ? date.date : date;
    if (dateVal) params.append('date', dateVal);
    if (leadId) params.append('leadId', leadId);
    if (shift) params.append('shift', shift);
    const res = await fetch(`${API_BASE}/reports/matrix?${params.toString()}`);
    const json = await res.json();
    return json || { allHours: [], matrix: [] };
  },

  async saveHourlyLog(log) {
    const res = await fetch(`${API_BASE}/reports/hourly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return res.json();
  },

  async updateHourlyLog(id, updates) {
    const res = await fetch(`${API_BASE}/reports/hourly/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteHourlyLog(id) {
    const res = await fetch(`${API_BASE}/reports/hourly/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getDailySummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/daily-summary?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getAdminOverview(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/admin-overview?${query}`);
    const json = await res.json();
    return json.data || {};
  },

  async getLeadOverview(leadId, dateOrParams = '') {
    const params = new URLSearchParams({ leadId });
    if (typeof dateOrParams === 'string' && dateOrParams) {
      params.append('date', dateOrParams);
    } else if (typeof dateOrParams === 'object' && dateOrParams !== null) {
      if (dateOrParams.date) params.append('date', dateOrParams.date);
      if (dateOrParams.startDate) params.append('startDate', dateOrParams.startDate);
      if (dateOrParams.endDate) params.append('endDate', dateOrParams.endDate);
      if (dateOrParams.shift) params.append('shift', dateOrParams.shift);
    }
    const res = await fetch(`${API_BASE}/reports/lead-overview?${params.toString()}`);
    const json = await res.json();
    return json.data || {};
  },

  getExportCsvUrl({ type = 'hourly', date = '', startDate = '', endDate = '', leadId = '' }) {
    const params = new URLSearchParams({ type, date, startDate, endDate });
    if (leadId) params.append('leadId', leadId);
    return `${API_BASE}/reports/export-csv?${params.toString()}`;
  },

  getExportExcelUrl({ date = '', startDate = '', endDate = '', leadId = '' }) {
    const params = new URLSearchParams({ date, startDate, endDate });
    if (leadId) params.append('leadId', leadId);
    return `${API_BASE}/reports/export-excel?${params.toString()}`;
  }
};
