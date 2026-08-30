import { db } from './src/db/database.js';

async function restoreDivya() {
  console.log('Restoring Divya logs for 2026-08-28...');
  
  await db.pool.query(`
    UPDATE hourly_logs 
    SET status = 'Completed', notes = '', task_count = 0, updated_at = CURRENT_TIMESTAMP
    WHERE date = '2026-08-28' AND member_id = 'mem_divya_ballagiri' AND status = 'On Leave'
  `);

  const res = await db.pool.query('SELECT * FROM hourly_logs WHERE date = $1 AND member_id = $2', ['2026-08-28', 'mem_divya_ballagiri']);
  console.log('Restored Divya logs:');
  res.rows.forEach(r => console.log(` - ${r.hour_slot}: ${r.project_name} | status: ${r.status} | tasks: ${r.task_count}`));

  process.exit(0);
}

restoreDivya().catch(e => { console.error(e); process.exit(1); });
