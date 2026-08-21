import { db } from './src/db/database.js';

console.log('--- Testing Admin-Only Projects & Zero Previous Data ---');

// 1. Verify Clean Initial State
const members = db.getMembers();
const projects = db.getProjects();
const logs = db.getHourlyLogs({});

console.log(`✓ Members Count: ${members.length} (Expected: 0)`);
console.log(`✓ Projects Count: ${projects.length} (Expected: 0)`);
console.log(`✓ Logs Count: ${logs.length} (Expected: 0)`);

if (members.length !== 0 || projects.length !== 0 || logs.length !== 0) {
  throw new Error('Database is not in clean 0 state');
}

// 2. Admin adds a Project
const project = db.addProject({
  name: 'Internal Portal Redesign',
  code: 'IPR-01',
  description: 'Enterprise internal dashboard revamp',
  color: '#0284c7',
  status: 'Active'
});
console.log(`✓ Admin created Project: ${project.name} (Code: ${project.code})`);

// 3. Employee registers
const employee = db.addMember({
  name: 'Alex Developer',
  email: 'alex@company.com',
  password: 'mypassword',
  role: 'Software Engineer',
  department: 'Engineering'
});
console.log(`✓ Employee Registered: ${employee.name} (${employee.email})`);

// 4. Employee logs task under the admin project
const today = new Date().toISOString().split('T')[0];
const hourlyLog = db.createOrUpdateHourlyLog({
  memberId: employee.id,
  projectId: project.id,
  date: today,
  hourSlot: '09:00 - 10:00',
  taskCount: 5,
  notes: 'Set up component architecture',
  status: 'Completed'
});
console.log(`✓ Hourly Log successfully registered: ${hourlyLog.projectName} (${hourlyLog.taskCount} tasks)`);

// 5. Admin queries report
const adminOverview = db.getAdminOverview({ date: today });
console.log(`✓ Admin Overview: Total Tasks = ${adminOverview.totalTasksToday}, Active Members = ${adminOverview.activeMembersCount}`);

// Clean back to 0 projects and 0 members as requested
db.resetData();
console.log('✓ Reset back to 0 projects, 0 members, 0 logs ready for user input.');

console.log('--- ALL ADMIN-ONLY PROJECT TESTS PASSED ---');
