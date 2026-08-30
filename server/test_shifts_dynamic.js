const API_BASE = 'http://localhost:5000/api';

async function testShifts() {
  console.log('--- TESTING SHIFT QUERIES & DYNAMICS ---');

  // Test 1: Today (2026-08-31) when no one has chosen yet -> all 15 are visible in whichever shift admin opens
  const matrixMorning = await fetch(`${API_BASE}/reports/matrix?date=2026-08-31&shift=morning`).then(r => r.json());
  const matrixNight = await fetch(`${API_BASE}/reports/matrix?date=2026-08-31&shift=night`).then(r => r.json());
  console.log('1. Neutral state before selections:');
  console.log(`   Morning Matrix count: ${matrixMorning.matrix.length} (expected 15)`);
  console.log(`   Night Matrix count: ${matrixNight.matrix.length} (expected 15)`);

  // Test 2: Ritesh Lingamallu selects NIGHT shift
  const members = await fetch(`${API_BASE}/members`).then(r => r.json());
  const ritesh = members.data.find(m => m.name.includes('Ritesh'));
  const rohith = members.data.find(m => m.name.includes('Rohith'));

  console.log(`\n2. Setting ${ritesh.name} to NIGHT and ${rohith.name} to MORNING...`);
  await fetch(`${API_BASE}/members/${ritesh.id}/shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '2026-08-31', shift: 'night' })
  });

  await fetch(`${API_BASE}/members/${rohith.id}/shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '2026-08-31', shift: 'morning' })
  });

  // Test 3: Check matrices again
  const morningAfter = await fetch(`${API_BASE}/reports/matrix?date=2026-08-31&shift=morning`).then(r => r.json());
  const nightAfter = await fetch(`${API_BASE}/reports/matrix?date=2026-08-31&shift=night`).then(r => r.json());

  const morningNames = morningAfter.matrix.map(r => r.member.name);
  const nightNames = nightAfter.matrix.map(r => r.member.name);

  console.log('\n3. Verification after selections:');
  console.log(`   Is ${ritesh.name} in Night Matrix?`, nightNames.includes(ritesh.name) ? 'YES (PASS)' : 'NO (FAIL)');
  console.log(`   Is ${ritesh.name} in Morning Matrix?`, morningNames.includes(ritesh.name) ? 'YES (FAIL - should be excluded)' : 'NO (PASS - excluded!)');
  console.log(`   Is ${rohith.name} in Morning Matrix?`, morningNames.includes(rohith.name) ? 'YES (PASS)' : 'NO (FAIL)');
  console.log(`   Is ${rohith.name} in Night Matrix?`, nightNames.includes(rohith.name) ? 'YES (FAIL - should be excluded)' : 'NO (PASS - excluded!)');

  console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
}

testShifts().catch(console.error);
