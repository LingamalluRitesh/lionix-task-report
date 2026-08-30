import { db } from './src/db/database.js';

async function check() {
  const members = await db.getMembers();
  console.log('Total members:', members.length);
  const leads = members.filter(m => (m.role || '').toLowerCase().includes('lead') || (m.role || '').toLowerCase().includes('coordinator'));
  console.log('Leads/Coordinators:', leads.map(l => ({ id: l.id, name: l.name, role: l.role })));

  const assignments = await db.getTeamAssignments();
  console.log('Team assignments map:', assignments);

  for (const l of leads) {
    const lAssign = await db.getTeamAssignments(l.id);
    console.log(`Assignments for ${l.name} (${l.id}):`, lAssign);
    const overview = await db.getLeadOverview(l.id, { date: '2026-08-29' });
    console.log(`Lead Overview for ${l.name} on 2026-08-29:`, {
      teamMembersCount: overview.teamMembers.length,
      teamLogsCount: overview.teamLogs.length,
      totalTeamTasks: overview.totalTeamTasks,
      totalTeamHours: overview.totalTeamHours,
      assignedCount: overview.assignedCount
    });
  }

  const allLogs29 = await db.getHourlyLogs({ date: '2026-08-29' });
  console.log(`Total logs in DB for 2026-08-29: ${allLogs29.length}`);
  const tasks29 = allLogs29.reduce((acc, l) => acc + (Number(l.taskCount) || 0), 0);
  console.log(`Total tasks across all members for 2026-08-29: ${tasks29}`);

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
