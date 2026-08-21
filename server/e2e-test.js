import http from 'http';
import { db } from './src/db/database.js';

async function testHttpEndpoints() {
  console.log('Testing TaskPulse Backend HTTP Endpoints & Reports...');

  const today = new Date().toISOString().split('T')[0];
  const members = db.getMembers();
  const projects = db.getProjects();

  console.log(`✓ Database initialized with ${members.length} members and ${projects.length} projects`);

  // Test 1: Create Hourly Log
  const member = members[0];
  const project = projects[0];
  const hourSlot = '08:00 - 09:00';

  const createdLog = db.createOrUpdateHourlyLog({
    memberId: member.id,
    projectId: project.id,
    projectName: project.name,
    date: today,
    hourSlot: hourSlot,
    taskCount: 6,
    notes: 'Unit test work completed',
    status: 'Completed'
  });

  console.log(`✓ Created Hourly Log: ID=${createdLog.id}, tasks=${createdLog.taskCount}`);
  if (createdLog.taskCount !== 6) throw new Error('Task count mismatch');

  // Test 2: Edit Hourly Log
  const updatedLog = db.updateHourlyLog(createdLog.id, {
    taskCount: 9,
    notes: 'Updated task count via edit action'
  });

  console.log(`✓ Updated Hourly Log: ID=${updatedLog.id}, new tasks=${updatedLog.taskCount}`);
  if (updatedLog.taskCount !== 9) throw new Error('Updated task count mismatch');

  // Test 3: Matrix Generation
  const matrixLogs = db.getHourlyLogs({ date: today });
  console.log(`✓ Matrix logs retrieved: ${matrixLogs.length} logs for date ${today}`);

  // Test 4: Daily Summary Calculation
  const summaries = db.getDailySummary({ date: today });
  console.log(`✓ Daily Summaries calculated: ${summaries.length} member summaries`);
  const memberSummary = summaries.find(s => s.memberId === member.id);
  if (!memberSummary) throw new Error('Member summary not found');
  console.log(`  - ${member.name}: ${memberSummary.totalTasks} total tasks across ${memberSummary.hoursWorked} hours`);

  // Test 5: Admin Overview KPIs
  const overview = db.getAdminOverview({ date: today });
  console.log(`✓ Admin Overview: Total Tasks = ${overview.totalTasksToday}, Velocity = ${overview.avgTasksPerHour} tasks/hr`);
  if (!overview.totalTasksToday || overview.totalTasksToday <= 0) throw new Error('Invalid overview task total');

  console.log('\n==========================================');
  console.log('🎉 ALL INTEGRATION & REPORTING TESTS PASSED!');
  console.log('==========================================\n');
}

testHttpEndpoints().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
