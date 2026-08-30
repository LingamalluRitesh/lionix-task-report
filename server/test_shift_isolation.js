const API_BASE = 'http://localhost:5000/api';

async function runShiftTests() {
  console.log('--- TESTING SHIFT ISOLATION FOR ADMIN & LEADS & COORDINATORS ---');

  const membersRes = await fetch(`${API_BASE}/members`).then(r => r.json());
  const members = membersRes.data || [];
  console.log(`Loaded ${members.length} members.`);

  const emp1 = members[0]; // e.g. Ritesh Lingamallu
  const emp2 = members[1]; // e.g. Rohith Vuppula
  const testDate = '2026-08-31';

  // 1. Employee 1 sets shift to 'night' on 2026-08-31
  console.log(`Setting ${emp1.name} to NIGHT shift on ${testDate}...`);
  const shiftRes1 = await fetch(`${API_BASE}/members/${emp1.id}/shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: testDate, shift: 'night' })
  }).then(r => r.json());
  console.log('1. Set Shift Res:', shiftRes1);

  // 2. Employee 2 sets shift to 'morning' on 2026-08-31
  console.log(`Setting ${emp2.name} to MORNING shift on ${testDate}...`);
  const shiftRes2 = await fetch(`${API_BASE}/members/${emp2.id}/shift`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: testDate, shift: 'morning' })
  }).then(r => r.json());
  console.log('2. Set Shift Res:', shiftRes2);

  // 3. Query Matrix for Morning Shift
  const morningMatrix = await fetch(`${API_BASE}/reports/matrix?date=${testDate}&shift=morning`).then(r => r.json());
  const morningNames = (morningMatrix.matrix || []).map(r => r.member.name);
  console.log('3. Morning Shift Matrix Members Count:', morningNames.length);
  console.log(`   Does Morning Matrix include ${emp1.name} (Night Shift)?`, morningNames.includes(emp1.name) ? 'FAIL (Included)' : 'PASS (Excluded!)');
  console.log(`   Does Morning Matrix include ${emp2.name} (Morning Shift)?`, morningNames.includes(emp2.name) ? 'PASS (Included!)' : 'FAIL (Missing)');

  // 4. Query Matrix for Night Shift
  const nightMatrix = await fetch(`${API_BASE}/reports/matrix?date=${testDate}&shift=night`).then(r => r.json());
  const nightNames = (nightMatrix.matrix || []).map(r => r.member.name);
  console.log('4. Night Shift Matrix Members Count:', nightNames.length);
  console.log(`   Does Night Matrix include ${emp1.name} (Night Shift)?`, nightNames.includes(emp1.name) ? 'PASS (Included!)' : 'FAIL (Missing)');
  console.log(`   Does Night Matrix include ${emp2.name} (Morning Shift)?`, nightNames.includes(emp2.name) ? 'FAIL (Included)' : 'PASS (Excluded!)');

  // 5. Query Lead Overview for Morning Shift
  const leadOverviewMorning = await fetch(`${API_BASE}/reports/lead-overview?leadId=${emp1.id}&date=${testDate}&shift=morning`).then(r => r.json());
  console.log('5. Lead Overview (Morning Shift) Members:', (leadOverviewMorning.data?.teamMembers || []).map(m => m.name));

  // 6. Query Lead Overview for Night Shift
  const leadOverviewNight = await fetch(`${API_BASE}/reports/lead-overview?leadId=${emp1.id}&date=${testDate}&shift=night`).then(r => r.json());
  console.log('6. Lead Overview (Night Shift) Members:', (leadOverviewNight.data?.teamMembers || []).map(m => m.name));

  // 7. Query Daily Summary for Morning vs Night
  const dailyMorning = await fetch(`${API_BASE}/reports/daily-summary?date=${testDate}&shift=morning`).then(r => r.json());
  const dailyNight = await fetch(`${API_BASE}/reports/daily-summary?date=${testDate}&shift=night`).then(r => r.json());
  console.log('7. Daily Summary counts:', {
    morningSummariesCount: dailyMorning.data?.length,
    nightSummariesCount: dailyNight.data?.length
  });

  console.log('--- SHIFT ISOLATION TESTS COMPLETE ---');
}

runShiftTests().catch(console.error);
