const API_BASE = 'http://localhost:5000/api';

async function testLeadOverview() {
  console.log('--- TESTING LEAD OVERVIEW & METRICS ---');

  const membersRes = await fetch(`${API_BASE}/members`).then(r => r.json());
  const members = membersRes.data || [];
  console.log(`Members count: ${members.length}`);

  const leadMember = members[0]; // Ritesh Lingamallu
  console.log(`Testing Lead: ${leadMember.name} (${leadMember.id})`);

  // Test 1: Lead overview on date with logs (2026-08-22)
  const overview22 = await fetch(`${API_BASE}/reports/lead-overview?leadId=${leadMember.id}&date=2026-08-22`).then(r => r.json());
  console.log('1. Lead Overview (2026-08-22):', {
    success: overview22.success,
    totalTeamTasks: overview22.data?.totalTeamTasks,
    totalTeamHours: overview22.data?.totalTeamHours,
    avgTeamTasksPerHour: overview22.data?.avgTeamTasksPerHour,
    assignedCount: overview22.data?.assignedCount,
    teamMembersCount: overview22.data?.teamMembers?.length
  });

  // Test 2: Matrix on date with logs (2026-08-22)
  const matrix22 = await fetch(`${API_BASE}/reports/matrix?date=2026-08-22&leadId=${leadMember.id}`).then(r => r.json());
  console.log('2. Matrix (2026-08-22):', {
    success: matrix22.success,
    matrixRows: matrix22.matrix?.length,
    totalTasksAcrossMatrix: (matrix22.matrix || []).reduce((acc, r) => acc + (Number(r.totalTasks) || 0), 0)
  });

  // Test 3: Lead overview on date with zero logs (2026-08-29)
  const overview29 = await fetch(`${API_BASE}/reports/lead-overview?leadId=${leadMember.id}&date=2026-08-29`).then(r => r.json());
  console.log('3. Lead Overview (2026-08-29):', {
    success: overview29.success,
    totalTeamTasks: overview29.data?.totalTeamTasks,
    totalTeamHours: overview29.data?.totalTeamHours,
    avgTeamTasksPerHour: overview29.data?.avgTeamTasksPerHour,
    assignedCount: overview29.data?.assignedCount,
    teamMembersCount: overview29.data?.teamMembers?.length
  });

  // Test 4: Matrix on date with zero logs (2026-08-29)
  const matrix29 = await fetch(`${API_BASE}/reports/matrix?date=2026-08-29&leadId=${leadMember.id}`).then(r => r.json());
  console.log('4. Matrix (2026-08-29):', {
    success: matrix29.success,
    matrixRows: matrix29.matrix?.length,
    totalTasksAcrossMatrix: (matrix29.matrix || []).reduce((acc, r) => acc + (Number(r.totalTasks) || 0), 0)
  });

  console.log('--- LEAD METRICS VERIFICATION COMPLETE ---');
}

testLeadOverview().catch(console.error);
