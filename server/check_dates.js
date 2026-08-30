import { db } from './src/db/database.js';

async function checkRange() {
  const logs = await db.getHourlyLogs({});
  console.log('All unique dates in database:');
  const dates = new Set(logs.map(l => l.date));
  console.log(Array.from(dates));
  
  process.exit(0);
}

checkRange().catch(e => { console.error(e); process.exit(1); });
