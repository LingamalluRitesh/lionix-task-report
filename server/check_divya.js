import { db } from './src/db/database.js';
import fs from 'fs';

async function checkDivya() {
  console.log('--- CHECKING DIVYA DATA ---');
  const divya = (await db.getMembers()).find(m => m.name.toLowerCase().includes('divya'));
  console.log('Divya member:', divya);

  if (divya) {
    const logs = await db.getHourlyLogs({ memberId: divya.id });
    console.log(`Divya total logs in PostgreSQL (${logs.length}):`);
    logs.forEach(l => console.log(`  Date: ${l.date} | Hour: ${l.hourSlot} | Tasks: ${l.taskCount} | Project: ${l.projectName} | Status: ${l.status} | Notes: ${l.notes}`));
  }

  const logs28 = await db.getHourlyLogs({ date: '2026-08-28' });
  console.log(`\nTotal logs on 2026-08-28 in PostgreSQL: ${logs28.length}`);
  logs28.forEach(l => console.log(`  Member: ${l.memberName || l.memberId} | Hour: ${l.hourSlot} | Tasks: ${l.taskCount} | Status: ${l.status} | Notes: ${l.notes}`));

  // Check if data.json or backup has 2026-08-28 logs
  if (fs.existsSync('./data.json')) {
    const raw = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    const divyaLocal = (raw.hourlyLogs || []).filter(l => l.memberId === divya?.id || (l.date && l.date.includes('28')));
    console.log(`\nLocal data.json logs for Divya or 28th: ${divyaLocal.length}`);
    divyaLocal.forEach(l => console.log('  Local log:', l));
  }

  process.exit(0);
}

checkDivya().catch(e => { console.error(e); process.exit(1); });
