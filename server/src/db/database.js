import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEON_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4IEY7avrsAKM@ep-restless-field-aylgikff-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname);
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create DB directory:', err);
}

const DB_FILE = path.join(DB_DIR, 'data.json');
const DEFAULT_EMPLOYEE_PASSWORD = 'Lionixllp';

class Database {
  constructor() {
    this.pool = null;
    this.usePostgres = false;
    this.localData = {
      admin: null,
      settings: { dailyTaskGoal: 100 },
      members: [],
      projects: [],
      hourlyLogs: []
    };
    this.init();
  }

  async init() {
    // 1. Initialize local JSON data
    this.loadLocalData();

    // 2. Initialize Neon PostgreSQL
    if (NEON_DATABASE_URL) {
      try {
        this.pool = new Pool({
          connectionString: NEON_DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });

        await this.pool.query('SELECT NOW()');
        this.usePostgres = true;
        console.log('🐘 Connected to Neon Cloud PostgreSQL Database!');

        await this.initPostgresSchema();
        await this.seedPostgresFromLocal();
      } catch (err) {
        console.error('⚠️ PostgreSQL connection warning, falling back to local storage:', err.message);
        this.usePostgres = false;
      }
    }
  }

  loadLocalData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.localData = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading local data.json:', err);
    }
  }

  saveLocalData() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localData, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local data.json:', err);
    }
  }

  async initPostgresSchema() {
    const schemaSql = `
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT 'Administrator',
        department VARCHAR(255) DEFAULT 'IT',
        avatar_color VARCHAR(50) DEFAULT '#f59e0b',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50),
        description TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT '#0284c7',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT 'Team Member',
        department VARCHAR(255) DEFAULT 'IT',
        avatar_color VARCHAR(50) DEFAULT '#0284c7',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hourly_logs (
        id VARCHAR(255) PRIMARY KEY,
        member_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255),
        project_name VARCHAR(255),
        date VARCHAR(50) NOT NULL,
        hour_slot VARCHAR(100) NOT NULL,
        task_count INT DEFAULT 0,
        notes TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'Completed',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (member_id, date, hour_slot)
      );

      CREATE TABLE IF NOT EXISTS team_assignments (
        lead_id VARCHAR(255) NOT NULL,
        member_id VARCHAR(255) NOT NULL,
        assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (lead_id, member_id)
      );
    `;
    await this.pool.query(schemaSql);
  }

  async seedPostgresFromLocal() {
    // 1. Seed Admin
    await this.pool.query(`
      INSERT INTO admin_users (id, name, email, password, role, department, avatar_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        avatar_color = EXCLUDED.avatar_color
    `, [
      'admin_root',
      'Uthej (Admin)',
      'uthej.lionix.com',
      'Uthej@2003',
      'Administrator',
      'IT',
      '#f59e0b'
    ]);

    // 2. Seed Settings
    await this.pool.query(`
      INSERT INTO app_settings (key, value)
      VALUES ('dailyTaskGoal', $1)
      ON CONFLICT (key) DO NOTHING
    `, [JSON.stringify({ dailyTaskGoal: 100 })]);

    // 3. Seed Projects
    if (this.localData.projects && this.localData.projects.length > 0) {
      for (const p of this.localData.projects) {
        await this.pool.query(`
          INSERT INTO projects (id, name, code, description, color, status)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            code = EXCLUDED.code,
            color = EXCLUDED.color,
            status = EXCLUDED.status
        `, [p.id, p.name, p.code, p.description || '', p.color || '#0284c7', p.status || 'Active']);
      }
    }

    // 4. Seed 15 Members
    if (this.localData.members && this.localData.members.length > 0) {
      for (const m of this.localData.members) {
        await this.pool.query(`
          INSERT INTO members (id, name, email, password, role, department, avatar_color, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            avatar_color = EXCLUDED.avatar_color,
            active = EXCLUDED.active
        `, [
          m.id,
          m.name,
          m.email,
          m.password || DEFAULT_EMPLOYEE_PASSWORD,
          m.role || 'Team Member',
          m.department || 'IT',
          m.avatarColor || '#0284c7',
          m.active !== undefined ? m.active : true
        ]);
      }
    }

    // 5. Seed Hourly Logs
    if (this.localData.hourlyLogs && this.localData.hourlyLogs.length > 0) {
      for (const l of this.localData.hourlyLogs) {
        await this.pool.query(`
          INSERT INTO hourly_logs (id, member_id, project_id, project_name, date, hour_slot, task_count, notes, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (member_id, date, hour_slot) DO UPDATE SET
            task_count = EXCLUDED.task_count,
            project_id = EXCLUDED.project_id,
            project_name = EXCLUDED.project_name,
            notes = EXCLUDED.notes,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
        `, [
          l.id,
          l.memberId,
          l.projectId,
          l.projectName,
          l.date,
          l.hourSlot,
          l.taskCount,
          l.notes || '',
          l.status || 'Completed'
        ]);
      }
    }
  }

  // --- Settings (Daily Task Goal & Active Shift) ---
  async getSettings() {
    if (this.usePostgres) {
      const res = await this.pool.query("SELECT value FROM app_settings WHERE key = 'app_config'");
      if (res.rows.length > 0) {
        const val = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
        return {
          dailyTaskGoal: val.dailyTaskGoal || 100,
          currentShift: val.currentShift || 'morning'
        };
      }
      const oldRes = await this.pool.query("SELECT value FROM app_settings WHERE key = 'dailyTaskGoal'");
      if (oldRes.rows.length > 0) {
        const val = typeof oldRes.rows[0].value === 'string' ? JSON.parse(oldRes.rows[0].value) : oldRes.rows[0].value;
        return {
          dailyTaskGoal: val.dailyTaskGoal || 100,
          currentShift: 'morning'
        };
      }
      return { dailyTaskGoal: 100, currentShift: 'morning' };
    }
    return this.localData.settings || { dailyTaskGoal: 100, currentShift: 'morning' };
  }

  async updateSettings(updates) {
    const current = await this.getSettings();
    let goal = updates.dailyTaskGoal !== undefined ? parseInt(updates.dailyTaskGoal, 10) : current.dailyTaskGoal;
    if (isNaN(goal) || goal < 1) goal = 100;
    if (goal >= 5000) goal = 4999;

    let shift = updates.currentShift || current.currentShift || 'morning';
    if (shift !== 'morning' && shift !== 'night') shift = 'morning';

    const val = { dailyTaskGoal: goal, currentShift: shift };
    if (this.usePostgres) {
      await this.pool.query(`
        INSERT INTO app_settings (key, value)
        VALUES ('app_config', $1)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `, [JSON.stringify(val)]);
      return val;
    }

    this.localData.settings = val;
    this.saveLocalData();
    return val;
  }

  // --- Login Validation ---
  async validateLogin(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (this.usePostgres) {
      // Check Admin
      const adminRes = await this.pool.query('SELECT * FROM admin_users LIMIT 1');
      if (adminRes.rows.length > 0) {
        const admin = adminRes.rows[0];
        const adminEmail = (admin.email || '').toLowerCase();
        if (
          (cleanId === adminEmail || cleanId === 'uthej@lionix.com' || cleanId === 'uthej' || cleanId.includes('uthej')) &&
          (cleanPass === admin.password || cleanPass === 'Uthej@2003')
        ) {
          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            department: admin.department || 'IT',
            avatarColor: admin.avatar_color || '#f59e0b',
            isAdmin: true
          };
        }
      }

      // Check Members (supports email, full name, first name, or matching name prefix)
      const memberRes = await this.pool.query(
        `SELECT * FROM members 
         WHERE (
           LOWER(email) = $1 
           OR LOWER(name) = $1 
           OR LOWER(SPLIT_PART(name, ' ', 1)) = $1
           OR LOWER(name) LIKE $2
           OR LOWER(email) LIKE $2
         ) AND active = true 
         ORDER BY (LOWER(SPLIT_PART(name, ' ', 1)) = $1) DESC, id ASC 
         LIMIT 1`,
        [cleanId, `${cleanId}%`]
      );
      if (memberRes.rows.length > 0) {
        const member = memberRes.rows[0];
        const expectedPass = member.password || DEFAULT_EMPLOYEE_PASSWORD;
        if (cleanPass === expectedPass || cleanPass === DEFAULT_EMPLOYEE_PASSWORD) {
          const roleLower = (member.role || '').toLowerCase();
          const isLead = roleLower.includes('lead') || roleLower.includes('coordinator') || roleLower.includes('manager');
          const assignedMemberIds = await this.getTeamAssignments(member.id);

          return {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department || 'IT',
            avatarColor: member.avatar_color || '#0284c7',
            isAdmin: false,
            isLead: Boolean(isLead || assignedMemberIds.length > 0),
            leadRole: member.role,
            assignedMemberIds
          };
        }
      }
      return null;
    }

    // Fallback Local
    if (
      (cleanId === 'uthej.lionix.com' || cleanId === 'uthej@lionix.com' || cleanId === 'uthej' || cleanId.includes('uthej')) &&
      cleanPass === 'Uthej@2003'
    ) {
      return {
        id: 'admin_root',
        name: 'Uthej (Admin)',
        email: 'uthej.lionix.com',
        role: 'Administrator',
        department: 'IT',
        avatarColor: '#f59e0b',
        isAdmin: true,
        isLead: false
      };
    }

    const member = this.localData.members.find(
      m => (
        m.email.toLowerCase() === cleanId ||
        m.name.toLowerCase() === cleanId ||
        m.name.toLowerCase().split(' ')[0] === cleanId ||
        m.name.toLowerCase().startsWith(cleanId) ||
        m.email.toLowerCase().startsWith(cleanId)
      ) && m.active
    );
    if (member && (cleanPass === member.password || cleanPass === DEFAULT_EMPLOYEE_PASSWORD)) {
      const roleLower = (member.role || '').toLowerCase();
      const isLead = roleLower.includes('lead') || roleLower.includes('coordinator') || roleLower.includes('manager');
      const assignedMemberIds = await this.getTeamAssignments(member.id);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department || 'IT',
        avatarColor: member.avatarColor || '#0284c7',
        isAdmin: false,
        isLead: Boolean(isLead || assignedMemberIds.length > 0),
        leadRole: member.role,
        assignedMemberIds
      };
    }
    return null;
  }

  // --- Members CRUD ---
  async getMembers(filterActive = false) {
    if (this.usePostgres) {
      let query = 'SELECT id, name, email, role, department, avatar_color as "avatarColor", active, created_at as "createdAt" FROM members';
      if (filterActive) {
        query += ' WHERE active = true';
      }
      query += ' ORDER BY name ASC';
      const res = await this.pool.query(query);
      return res.rows;
    }

    if (filterActive) {
      return this.localData.members.filter(m => m.active).map(this.sanitizeMember);
    }
    return this.localData.members.map(this.sanitizeMember);
  }

  async getMemberById(id) {
    if (this.usePostgres) {
      const res = await this.pool.query(
        'SELECT id, name, email, role, department, avatar_color as "avatarColor", active, created_at as "createdAt" FROM members WHERE id = $1',
        [id]
      );
      return res.rows.length > 0 ? res.rows[0] : null;
    }
    const mem = this.localData.members.find(m => m.id === id);
    return mem ? this.sanitizeMember(mem) : null;
  }

  sanitizeMember(member) {
    const { password, ...safe } = member;
    return safe;
  }

  async addMember(member) {
    const cleanEmail = (member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@lionix.com`).trim().toLowerCase();
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const name = member.name.trim();
    const password = member.password || DEFAULT_EMPLOYEE_PASSWORD;
    const role = member.role || 'Python Developer';
    const department = member.department || 'IT';
    const avatarColor = member.avatarColor || '#0284c7';
    const active = member.active !== undefined ? member.active : true;

    if (this.usePostgres) {
      const res = await this.pool.query(`
        INSERT INTO members (id, name, email, password, role, department, avatar_color, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, email, role, department, avatar_color as "avatarColor", active, created_at as "createdAt"
      `, [id, name, cleanEmail, password, role, department, avatarColor, active]);
      return res.rows[0];
    }

    const newMem = { id, name, email: cleanEmail, password, role, department, avatarColor, active, createdAt: new Date().toISOString() };
    this.localData.members.push(newMem);
    this.saveLocalData();
    return this.sanitizeMember(newMem);
  }

  async updateMember(id, updates) {
    if (this.usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.name) { fields.push(`name = $${idx++}`); values.push(updates.name.trim()); }
      if (updates.email) { fields.push(`email = $${idx++}`); values.push(updates.email.trim().toLowerCase()); }
      if (updates.password) { fields.push(`password = $${idx++}`); values.push(updates.password); }
      if (updates.role) { fields.push(`role = $${idx++}`); values.push(updates.role); }
      if (updates.department) { fields.push(`department = $${idx++}`); values.push(updates.department); }
      if (updates.avatarColor) { fields.push(`avatar_color = $${idx++}`); values.push(updates.avatarColor); }
      if (updates.active !== undefined) { fields.push(`active = $${idx++}`); values.push(updates.active); }

      if (fields.length === 0) return this.getMemberById(id);

      values.push(id);
      const query = `
        UPDATE members SET ${fields.join(', ')} WHERE id = $${idx}
        RETURNING id, name, email, role, department, avatar_color as "avatarColor", active, created_at as "createdAt"
      `;
      const res = await this.pool.query(query, values);
      return res.rows.length > 0 ? res.rows[0] : null;
    }

    const index = this.localData.members.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.localData.members[index] = { ...this.localData.members[index], ...updates };
    this.saveLocalData();
    return this.sanitizeMember(this.localData.members[index]);
  }

  async deleteMember(id) {
    if (this.usePostgres) {
      await this.pool.query('DELETE FROM hourly_logs WHERE member_id = $1', [id]);
      const res = await this.pool.query('DELETE FROM members WHERE id = $1', [id]);
      return res.rowCount > 0;
    }

    const index = this.localData.members.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.localData.members.splice(index, 1);
    this.localData.hourlyLogs = this.localData.hourlyLogs.filter(l => l.memberId !== id);
    this.saveLocalData();
    return true;
  }

  // --- Team Assignments (Team Leads & Coordinators) ---
  async getTeamAssignments(leadId = null) {
    if (this.usePostgres) {
      if (leadId) {
        const res = await this.pool.query(
          'SELECT member_id FROM team_assignments WHERE lead_id = $1',
          [leadId]
        );
        return res.rows.map(r => r.member_id);
      } else {
        const res = await this.pool.query('SELECT lead_id, member_id FROM team_assignments');
        const map = {};
        res.rows.forEach(r => {
          if (!map[r.lead_id]) map[r.lead_id] = [];
          map[r.lead_id].push(r.member_id);
        });
        return map;
      }
    }

    if (!this.localData.teamAssignments) this.localData.teamAssignments = {};
    if (leadId) {
      return this.localData.teamAssignments[leadId] || [];
    }
    return this.localData.teamAssignments || {};
  }

  async assignTeammates(leadId, memberIds = []) {
    const cleanIds = Array.isArray(memberIds) ? memberIds : [];
    if (this.usePostgres) {
      await this.pool.query('DELETE FROM team_assignments WHERE lead_id = $1', [leadId]);
      for (const mId of cleanIds) {
        await this.pool.query(
          'INSERT INTO team_assignments (lead_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [leadId, mId]
        );
      }
      return cleanIds;
    }

    if (!this.localData.teamAssignments) this.localData.teamAssignments = {};
    this.localData.teamAssignments[leadId] = cleanIds;
    this.saveLocalData();
    return cleanIds;
  }

  async getLeadOverview(leadId, { date, startDate, endDate } = {}) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const assignedMemberIds = await this.getTeamAssignments(leadId);
    
    // Include the lead themselves + their assigned members
    const allRelevantIds = Array.from(new Set([leadId, ...assignedMemberIds]));
    
    const allMembers = await this.getMembers();
    const teamMembers = allMembers.filter(m => allRelevantIds.includes(m.id));
    
    const logs = await this.getHourlyLogs({ date: targetDate, startDate, endDate });
    const teamLogs = logs.filter(l => allRelevantIds.includes(l.memberId));
    
    const summaries = await this.getDailySummary({ date: targetDate, startDate, endDate });
    const teamSummaries = summaries.filter(s => allRelevantIds.includes(s.memberId));

    return {
      date: targetDate,
      leadId,
      teamMembers,
      teamLogs,
      teamSummaries,
      totalTeamTasks: teamLogs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0),
      totalTeamHours: teamLogs.length,
      assignedCount: assignedMemberIds.length
    };
  }

  // --- Projects CRUD ---
  async getProjects(filterActive = false) {
    if (this.usePostgres) {
      let query = 'SELECT id, name, code, description, color, status, created_at as "createdAt" FROM projects';
      if (filterActive) query += " WHERE status = 'Active'";
      query += ' ORDER BY name ASC';
      const res = await this.pool.query(query);
      return res.rows;
    }

    if (filterActive) return this.localData.projects.filter(p => p.status === 'Active');
    return this.localData.projects;
  }

  async getProjectById(id) {
    if (this.usePostgres) {
      const res = await this.pool.query('SELECT id, name, code, description, color, status, created_at as "createdAt" FROM projects WHERE id = $1', [id]);
      return res.rows.length > 0 ? res.rows[0] : null;
    }
    return this.localData.projects.find(p => p.id === id);
  }

  async addProject(project) {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const name = project.name.trim();
    const code = (project.code || name.substring(0, 3)).toUpperCase();
    const description = project.description || '';
    const color = project.color || '#0284c7';
    const status = project.status || 'Active';

    if (this.usePostgres) {
      const res = await this.pool.query(`
        INSERT INTO projects (id, name, code, description, color, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, code, description, color, status, created_at as "createdAt"
      `, [id, name, code, description, color, status]);
      return res.rows[0];
    }

    const newP = { id, name, code, description, color, status, createdAt: new Date().toISOString() };
    this.localData.projects.push(newP);
    this.saveLocalData();
    return newP;
  }

  async updateProject(id, updates) {
    if (this.usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.name) { fields.push(`name = $${idx++}`); values.push(updates.name.trim()); }
      if (updates.code) { fields.push(`code = $${idx++}`); values.push(updates.code.trim().toUpperCase()); }
      if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }
      if (updates.color) { fields.push(`color = $${idx++}`); values.push(updates.color); }
      if (updates.status) { fields.push(`status = $${idx++}`); values.push(updates.status); }

      if (fields.length === 0) return this.getProjectById(id);

      values.push(id);
      const res = await this.pool.query(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, code, description, color, status, created_at as "createdAt"`, values);
      return res.rows.length > 0 ? res.rows[0] : null;
    }

    const index = this.localData.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.localData.projects[index] = { ...this.localData.projects[index], ...updates };
    this.saveLocalData();
    return this.localData.projects[index];
  }

  async deleteProject(id) {
    if (this.usePostgres) {
      const res = await this.pool.query('DELETE FROM projects WHERE id = $1', [id]);
      return res.rowCount > 0;
    }

    const index = this.localData.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.localData.projects.splice(index, 1);
    this.saveLocalData();
    return true;
  }

  // --- Hourly Logs CRUD & Reporting ---
  async getHourlyLogs({ date, memberId, projectId, startDate, endDate }) {
    if (this.usePostgres) {
      let conditions = [];
      let values = [];
      let idx = 1;

      if (date) { conditions.push(`hl.date = $${idx++}`); values.push(date); }
      if (startDate && endDate) {
        conditions.push(`hl.date >= $${idx++} AND hl.date <= $${idx++}`);
        values.push(startDate, endDate);
      } else if (startDate) {
        conditions.push(`hl.date >= $${idx++}`);
        values.push(startDate);
      } else if (endDate) {
        conditions.push(`hl.date <= $${idx++}`);
        values.push(endDate);
      }
      if (memberId) { conditions.push(`hl.member_id = $${idx++}`); values.push(memberId); }
      if (projectId) { conditions.push(`hl.project_id = $${idx++}`); values.push(projectId); }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT 
          hl.id,
          hl.member_id as "memberId",
          hl.project_id as "projectId",
          hl.project_name as "projectName",
          hl.date,
          hl.hour_slot as "hourSlot",
          hl.task_count as "taskCount",
          hl.notes,
          hl.status,
          hl.created_at as "createdAt",
          hl.updated_at as "updatedAt",
          COALESCE(m.name, 'Team Member') as "memberName",
          COALESCE(m.role, 'Team Member') as "memberRole",
          COALESCE(m.department, 'IT') as "memberDepartment",
          COALESCE(m.avatar_color, '#0284c7') as "memberColor",
          COALESCE(p.code, 'Data') as "projectCode",
          COALESCE(p.color, '#0284c7') as "projectColor"
        FROM hourly_logs hl
        LEFT JOIN members m ON hl.member_id = m.id
        LEFT JOIN projects p ON hl.project_id = p.id
        ${whereClause}
        ORDER BY hl.date DESC, hl.hour_slot ASC
      `;
      const res = await this.pool.query(query, values);
      return res.rows;
    }

    let logs = [...this.localData.hourlyLogs];
    if (date) logs = logs.filter(l => l.date === date);
    if (memberId) logs = logs.filter(l => l.memberId === memberId);
    if (projectId) logs = logs.filter(l => l.projectId === projectId);
    return logs;
  }

  async createOrUpdateHourlyLog({ memberId, projectId, projectName, date, hourSlot, taskCount, notes, status }) {
    const cleanTaskCount = Math.max(0, parseInt(taskCount, 10) || 0);
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    if (this.usePostgres) {
      const res = await this.pool.query(`
        INSERT INTO hourly_logs (id, member_id, project_id, project_name, date, hour_slot, task_count, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (member_id, date, hour_slot) DO UPDATE SET
          task_count = EXCLUDED.task_count,
          project_id = EXCLUDED.project_id,
          project_name = EXCLUDED.project_name,
          notes = EXCLUDED.notes,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING 
          id, member_id as "memberId", project_id as "projectId", project_name as "projectName",
          date, hour_slot as "hourSlot", task_count as "taskCount", notes, status
      `, [id, memberId, projectId, projectName, date, hourSlot, cleanTaskCount, notes || '', status || 'Completed']);
      return res.rows[0];
    }

    const existingIndex = this.localData.hourlyLogs.findIndex(
      l => l.memberId === memberId && l.date === date && l.hourSlot === hourSlot
    );

    if (existingIndex !== -1) {
      this.localData.hourlyLogs[existingIndex] = {
        ...this.localData.hourlyLogs[existingIndex],
        projectId,
        projectName,
        taskCount: cleanTaskCount,
        notes: notes !== undefined ? notes : this.localData.hourlyLogs[existingIndex].notes,
        status: status || 'Completed',
        updatedAt: new Date().toISOString()
      };
      this.saveLocalData();
      return this.localData.hourlyLogs[existingIndex];
    } else {
      const newLog = {
        id, memberId, projectId, projectName, date, hourSlot, taskCount: cleanTaskCount,
        notes: notes || '', status: status || 'Completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      this.localData.hourlyLogs.push(newLog);
      this.saveLocalData();
      return newLog;
    }
  }

  async updateHourlyLog(id, updates) {
    if (this.usePostgres) {
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.projectId) { fields.push(`project_id = $${idx++}`); values.push(updates.projectId); }
      if (updates.projectName) { fields.push(`project_name = $${idx++}`); values.push(updates.projectName); }
      if (updates.taskCount !== undefined) { fields.push(`task_count = $${idx++}`); values.push(Math.max(0, parseInt(updates.taskCount, 10) || 0)); }
      if (updates.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(updates.notes); }
      if (updates.status) { fields.push(`status = $${idx++}`); values.push(updates.status); }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const res = await this.pool.query(`
        UPDATE hourly_logs SET ${fields.join(', ')} WHERE id = $${idx}
        RETURNING id, member_id as "memberId", project_id as "projectId", project_name as "projectName",
        date, hour_slot as "hourSlot", task_count as "taskCount", notes, status
      `, values);
      return res.rows.length > 0 ? res.rows[0] : null;
    }

    const index = this.localData.hourlyLogs.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.localData.hourlyLogs[index] = { ...this.localData.hourlyLogs[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveLocalData();
    return this.localData.hourlyLogs[index];
  }

  async deleteHourlyLog(id) {
    if (this.usePostgres) {
      const res = await this.pool.query('DELETE FROM hourly_logs WHERE id = $1', [id]);
      return res.rowCount > 0;
    }

    const index = this.localData.hourlyLogs.findIndex(l => l.id === id);
    if (index === -1) return false;
    this.localData.hourlyLogs.splice(index, 1);
    this.saveLocalData();
    return true;
  }

  // --- Aggregations & Reports ---
  async getDailySummary({ date, startDate, endDate, memberId }) {
    const logs = await this.getHourlyLogs({ date, startDate, endDate, memberId });
    const members = await this.getMembers();

    const summaryMap = {};

    logs.forEach(log => {
      const key = `${log.date}_${log.memberId}`;
      if (!summaryMap[key]) {
        const member = members.find(m => m.id === log.memberId) || { name: log.memberName || 'Team Member', role: 'Python Developer', department: 'IT', avatarColor: '#0284c7' };
        summaryMap[key] = {
          date: log.date,
          memberId: log.memberId,
          memberName: member.name,
          memberRole: member.role,
          memberDepartment: member.department || 'IT',
          memberColor: member.avatarColor || '#0284c7',
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

      const projName = log.projectName || 'Data Annotation';
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

  async getAdminOverview({ date, startDate, endDate }) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logs = await this.getHourlyLogs({ date: targetDate, startDate, endDate });
    const allMembers = await this.getMembers();
    const allProjects = await this.getProjects();
    const settings = await this.getSettings();

    const totalTasksToday = logs.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);
    const activeMemberIds = new Set(logs.map(l => l.memberId));
    const totalHoursLogged = logs.length;
    const avgTasksPerHour = totalHoursLogged > 0 ? (totalTasksToday / totalHoursLogged).toFixed(1) : '0.0';

    const projectTaskMap = {};
    logs.forEach(l => {
      const pName = l.projectName || 'Data Annotation';
      projectTaskMap[pName] = (projectTaskMap[pName] || 0) + (Number(l.taskCount) || 0);
    });

    const projectDistribution = Object.entries(projectTaskMap).map(([name, tasks]) => {
      const proj = allProjects.find(p => p.name === name);
      return {
        name,
        tasks,
        color: proj ? proj.color : (name.includes('Infography') ? '#7c3aed' : '#0284c7')
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
          name: mem ? mem.name : (l.memberName || 'Team Member'),
          role: mem ? mem.role : 'Python Developer',
          department: mem ? (mem.department || 'IT') : 'IT',
          avatarColor: mem ? mem.avatarColor : '#0284c7',
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
      dailyTaskGoal: settings.dailyTaskGoal || 100,
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
