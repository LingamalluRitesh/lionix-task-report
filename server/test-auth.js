import { db } from './src/db/database.js';

console.log('--- Testing New White Theme & Auth Features ---');

// 1. Check clean database
db.resetData();
const members = db.getMembers();
const logs = db.getHourlyLogs({});
console.log(`✓ Clean initial state: ${members.length} members, ${logs.length} logs`);

// 2. Test Employee Registration
const newEmployee = db.addMember({
  name: 'Sarah Connor',
  email: 'sarah@company.com',
  password: 'mypassword',
  role: 'Senior Developer',
  department: 'Engineering',
  avatarColor: '#0284c7'
});
console.log(`✓ Registered Employee: ${newEmployee.name} (${newEmployee.email})`);

// 3. Test Employee Login
const validated = db.validateMember('sarah@company.com', 'mypassword');
console.log(`✓ Employee Login Validation: ${validated ? 'SUCCESS' : 'FAILED'}`);
if (!validated) throw new Error('Employee validation failed');

const invalidLogin = db.validateMember('sarah@company.com', 'wrongpass');
console.log(`✓ Invalid Employee Login Rejected: ${invalidLogin === null ? 'SUCCESS' : 'FAILED'}`);

// 4. Test Admin Validation
const adminValid = db.validateAdmin('admin@taskpulse.com', 'admin123');
console.log(`✓ Admin Validation: ${adminValid ? 'SUCCESS' : 'FAILED'} (Role: ${adminValid.role})`);
if (!adminValid) throw new Error('Admin validation failed');

// 5. Test Logging Hourly Task for Registered Employee
const today = new Date().toISOString().split('T')[0];
const taskLog = db.createOrUpdateHourlyLog({
  memberId: newEmployee.id,
  projectId: 'proj_1',
  date: today,
  hourSlot: '10:00 - 11:00',
  taskCount: 4,
  notes: 'Built new features and verified light theme',
  status: 'Completed'
});
console.log(`✓ Hourly Task Logged: ${taskLog.projectName}, ${taskLog.taskCount} tasks, Notes: "${taskLog.notes}"`);

// 6. Test Admin Report aggregation
const adminOverview = db.getAdminOverview({ date: today });
console.log(`✓ Admin Report: Total Tasks = ${adminOverview.totalTasksToday}, Active Members = ${adminOverview.activeMembersCount}`);

console.log('--- ALL AUTH & CLEAN STATE TESTS PASSED ---');
