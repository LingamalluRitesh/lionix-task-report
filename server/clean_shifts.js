import { db } from './src/db/database.js';

async function cleanShifts() {
  await db.pool.query('DELETE FROM member_shifts');
  console.log('Cleared all member_shifts records.');
  process.exit(0);
}

cleanShifts().catch(e => { console.error(e); process.exit(1); });
