import { db } from './src/db/database.js';

async function inspectLogs() {
  const logs = await db.getHourlyLogs({});
  console.log(`Total logs in DB: ${logs.length}`);
  
  const hourSlotsCount = {};
  logs.forEach(l => {
    hourSlotsCount[l.hourSlot] = (hourSlotsCount[l.hourSlot] || 0) + 1;
  });
  console.log('Logs by hourSlot:', hourSlotsCount);

  const memberShifts = await db.getMemberShiftsForDate();
  console.log('Current memberShifts records:', memberShifts);

  const allMembers = await db.getMembers();
  console.log('All members with shift property:');
  allMembers.forEach(m => console.log(` - ${m.name} (${m.id}): shift=${m.shift}`));

  // Check what members have logs in night hours vs morning hours for each date
  const dateMap = {};
  logs.forEach(l => {
    if (!dateMap[l.date]) dateMap[l.date] = {};
    if (!dateMap[l.date][l.memberId]) dateMap[l.date][l.memberId] = [];
    dateMap[l.date][l.memberId].push(l.hourSlot);
  });

  console.log('\nLogs per member per date:');
  Object.entries(dateMap).forEach(([d, mObj]) => {
    console.log(`Date: ${d}`);
    Object.entries(mObj).forEach(([mId, slots]) => {
      console.log(`  Member ${mId} has ${slots.length} logs:`, slots.slice(0, 3));
    });
  });

  process.exit(0);
}

inspectLogs().catch(e => { console.error(e); process.exit(1); });
