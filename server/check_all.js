import { db } from './src/db/database.js';

async function checkAll() {
  const members = await db.getMembers();
  console.log('All members in DB:');
  members.forEach(m => console.log(` - ID: ${m.id} | Name: ${m.name} | Role: ${m.role} | Email: ${m.email}`));

  const allLogs = await db.getHourlyLogs({});
  console.log(`Total logs in DB across all dates: ${allLogs.length}`);

  const dateMap = {};
  allLogs.forEach(l => {
    dateMap[l.date] = (dateMap[l.date] || 0) + 1;
  });
  console.log('Logs per date:', dateMap);

  const assignments = await db.getTeamAssignments();
  console.log('Team assignments table:', assignments);

  process.exit(0);
}

checkAll().catch(e => { console.error(e); process.exit(1); });
