import { db } from './src/db/database.js';

console.log('--- Testing Backend DB Operations ---');

// 1. Check seed members
const members = db.getMembers();
console.log(`✓ Seed Members Count: ${members.length}`);
if (members.length === 0) throw new Error('Members seed failed');

// 2. Check seed projects
const projects = db.getProjects();
console.log(`✓ Seed Projects Count: ${projects.length}`);
if (projects.length === 0) throw new Error('Projects seed failed');

// 3. Test creating an hourly task
const today = new Date().toISOString().split('T')[0];
const newLog = db.createOrUpdateHourlyLog({
  memberId: members[0].id,
  projectId: projects[0].id,
  date: today,
  hourSlot: '13:00 - 14:00',
  taskCount: 5,
  notes: 'Testing task count update',
  status: 'Completed'
});
console.log(`✓ Created/Upserted Hourly Log: ID=${newLog.id}, tasks=${newLog.taskCount}`);

// 4. Test editing the hourly task
const updatedLog = db.updateHourlyLog(newLog.id, {
  taskCount: 8,
  notes: 'Updated to 8 tasks successfully'
});
console.log(`✓ Updated Log: ID=${updatedLog.id}, new taskCount=${updatedLog.taskCount}, notes="${updatedLog.notes}"`);
if (updatedLog.taskCount !== 8) throw new Error('Update failed');

// 5. Test Admin overview calculation
const overview = db.getAdminOverview({ date: today });
console.log(`✓ Admin Overview calculated: Total Tasks Today = ${overview.totalTasksToday}, Active Members = ${overview.activeMembersCount}`);

// 6. Test Daily Summary aggregation
const summaries = db.getDailySummary({ date: today });
console.log(`✓ Daily Summaries calculated: ${summaries.length} members with logs`);

console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY ---');
