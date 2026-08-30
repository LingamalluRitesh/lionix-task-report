import { db } from './src/db/database.js';

async function checkDivyaOnly() {
  const res = await db.pool.query('SELECT * FROM hourly_logs WHERE date = $1 AND member_id = $2', ['2026-08-28', 'mem_divya_ballagiri']);
  console.log('Divya logs on 2026-08-28 in PostgreSQL:');
  console.log(res.rows);

  process.exit(0);
}

checkDivyaOnly().catch(e => { console.error(e); process.exit(1); });
