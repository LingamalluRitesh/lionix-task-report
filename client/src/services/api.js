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
    return json.data || { dailyTaskGoal: 20 };
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

  // Reports
  async getHourlyLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/hourly?${query}`);
    const json = await res.json();
    return json.data || [];
  },

  async getMatrix(date) {
    const res = await fetch(`${API_BASE}/reports/matrix?date=${date}`);
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

  getExportCsvUrl({ type = 'hourly', date = '', startDate = '', endDate = '' }) {
    const params = new URLSearchParams({ type, date, startDate, endDate });
    return `${API_BASE}/reports/export-csv?${params.toString()}`;
  }
};
