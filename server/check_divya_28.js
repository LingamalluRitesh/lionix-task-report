import { db } from './src/db/database.js';

async function checkDivyaLogs() {
  const res = await db.pool.query('SELECT * FROM hourly_logs WHERE member_id = $1', ['mem_divya_ballagiri']);
  console.log('Divya logs in DB:', res.rows);

  const logs28 = await db.pool.query('SELECT * FROM hourly_logs WHERE date = $1', ['2026-08-28']);
  console.log('All logs on 2026-08-28:', logs28.rows);

  process.exit(0);
}

checkDivyaLogs().catch(e => { console.error(e); process.exit(1); });
