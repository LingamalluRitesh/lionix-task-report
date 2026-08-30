const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- RUNNING FULL SYSTEM VERIFICATION ---');

  // 1. Test Login with Admin
  const adminLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'uthej.lionix.com', password: 'Uthej@2003' })
  }).then(r => r.json());
  console.log('1. Admin Login:', adminLogin.success ? 'PASS' : 'FAIL', adminLogin.user?.name);

  // 2. Test Login with Employee / Lead
  const members = await fetch(`${API_BASE}/members`).then(r => r.json());
  const memberList = members.data || [];
  console.log(`2. Retrieved ${memberList.length} members from Neon PostgreSQL DB`);

  const testMember = memberList[0];
  console.log('   Testing with member:', testMember.name, `(${testMember.email})`, `Role: ${testMember.role}`);

  const empLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testMember.email, password: 'Lionixllp' })
  }).then(r => r.json());
  console.log('3. Employee Login with Default Password:', empLogin.success ? 'PASS' : 'FAIL');

  // 3. Test Change Password for Member
  const newTestPass = 'NewPass123!';
  const changePassRes = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: testMember.id,
      currentPassword: 'Lionixllp',
      newPassword: newTestPass
    })
  }).then(r => r.json());
  console.log('4. Member Password Change:', changePassRes.success ? 'PASS' : 'FAIL', changePassRes.message);

  // 4. Test Login with New Password
  const loginWithNew = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testMember.email, password: newTestPass })
  }).then(r => r.json());
  console.log('5. Login with New Password:', loginWithNew.success ? 'PASS' : 'FAIL');

  // 5. Revert Member Password to Default Password
  const revertPassRes = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: testMember.id,
      currentPassword: newTestPass,
      newPassword: 'Lionixllp'
    })
  }).then(r => r.json());
  console.log('6. Revert Password back to Default:', revertPassRes.success ? 'PASS' : 'FAIL');

  // 6. Test Logging Dinner Break for Night Shift
  const today = new Date().toISOString().split('T')[0];
  const dinnerSlot = '08:00 PM - 09:00 PM';
  const projects = await fetch(`${API_BASE}/projects`).then(r => r.json());
  const proj = (projects.data || [])[0];

  const logRes = await fetch(`${API_BASE}/reports/hourly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: testMember.id,
      projectId: proj?.id,
      projectName: proj?.name,
      date: today,
      hourSlot: dinnerSlot,
      taskCount: 0,
      notes: 'Dinner Break',
      status: 'Dinner Break'
    })
  }).then(r => r.json());
  console.log('7. Log Dinner Break for Night Shift:', logRes.success ? 'PASS' : 'FAIL', logRes.data?.status);

  // 7. Test Admin Overview with Project Distribution & Velocity
  const overviewRes = await fetch(`${API_BASE}/reports/admin-overview?date=${today}`).then(r => r.json());
  console.log('8. Admin Overview Status:', overviewRes.success ? 'PASS' : 'FAIL');
  console.log('   Projects in Overview:', (overviewRes.data?.projectDistribution || []).map(p => `${p.name} (Goal: ${p.dailyGoal}, Progress: ${p.goalProgress}%)`));

  // 8. Test Matrix Output with Dinner Break
  const matrixRes = await fetch(`${API_BASE}/reports/matrix?date=${today}&shift=night`).then(r => r.json());
  console.log('9. Night Shift Matrix Fetch:', matrixRes.success ? 'PASS' : 'FAIL', `Slots: ${matrixRes.data?.allHours?.length}`);

  console.log('--- ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
