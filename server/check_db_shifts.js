import { db } from './src/db/database.js';

async function checkMemberShifts() {
  const res = await db.pool.query('SELECT * FROM member_shifts');
  console.log('member_shifts in PostgreSQL:', res.rows);

  const members = await db.pool.query('SELECT id, name, role FROM members');
  console.log('All members:', members.rows);

  process.exit(0);
}

checkMemberShifts().catch(e => { console.error(e); process.exit(1); });
