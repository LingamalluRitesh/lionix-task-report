import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return { status: res.status, data: await res.json(), headers: res.headers };
  } else {
    const arrayBuffer = await res.arrayBuffer();
    return { 
      status: res.status, 
      buffer: Buffer.from(arrayBuffer), 
      headers: res.headers, 
      text: Buffer.from(arrayBuffer).toString('utf-8') 
    };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SYSTEM VERIFICATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Members and Project Fields
    console.log('1️⃣ Testing Members & Project Fields:');
    const membersRes = await request('/members');
    assert(membersRes.status === 200 && membersRes.data.success, 'Fetch all members API works');
    assert(Array.isArray(membersRes.data.data) && membersRes.data.data.length > 0, `Retrieved ${membersRes.data.data.length} team members`);
    const sampleMember = membersRes.data.data[0];
    assert('assignedProjectId' in sampleMember || 'assignedProjectName' in sampleMember, 'Member object has assigned project fields');

    // 2. Projects & Custom Daily Goals
    console.log('\n2️⃣ Testing Projects & Custom Daily Goals:');
    const projectsRes = await request('/projects');
    assert(projectsRes.status === 200 && projectsRes.data.success, 'Fetch all projects API works');
    assert(Array.isArray(projectsRes.data.data) && projectsRes.data.data.length > 0, `Retrieved ${projectsRes.data.data.length} projects`);
    const sampleProj = projectsRes.data.data[0];
    assert('dailyGoal' in sampleProj, `Projects have dailyGoal field (e.g. ${sampleProj.name} goal: ${sampleProj.dailyGoal})`);

    // Create & Update Test Project
    const newProjRes = await request('/projects', {
      method: 'POST',
      body: { name: `Test_Proj_${Date.now()}`, description: 'Test Project', dailyGoal: 350, color: '#10b981' }
    });
    assert(newProjRes.status === 201 && newProjRes.data.success, 'Created project with custom dailyGoal: 350');
    const createdProj = newProjRes.data.data;

    const updateProjRes = await request(`/projects/${createdProj.id}`, {
      method: 'PUT',
      body: { dailyGoal: 500 }
    });
    assert(updateProjRes.status === 200 && updateProjRes.data.success, 'Updated project dailyGoal to 500');

    // 3. Project Assignment for Members
    console.log('\n3️⃣ Testing Admin/Lead Project Assignment:');
    const assignProjRes = await request(`/members/${sampleMember.id}/assign-project`, {
      method: 'POST',
      body: { projectId: createdProj.id, projectName: createdProj.name }
    });
    assert(assignProjRes.status === 200 && assignProjRes.data.success, `Assigned member "${sampleMember.name}" to project "${createdProj.name}"`);

    const verifyMemberRes = await request(`/members/${sampleMember.id}`);
    assert(verifyMemberRes.data.data.assignedProjectId === createdProj.id, 'Verified member has updated assignedProjectId in DB');

    // 4. Shift & Settings Synchronization
    console.log('\n4️⃣ Testing Shift & Settings Synchronization:');
    const settingsGet = await request('/reports/settings');
    assert(settingsGet.status === 200 && settingsGet.data.success, 'Fetched system settings');

    const shiftChangeRes = await request('/reports/settings', {
      method: 'PUT',
      body: { currentShift: 'night' }
    });
    assert(shiftChangeRes.status === 200 && shiftChangeRes.data.data.currentShift === 'night', 'Switched shift to night (8PM - 5AM)');

    const shiftRestoreRes = await request('/reports/settings', {
      method: 'PUT',
      body: { currentShift: 'morning' }
    });
    assert(shiftRestoreRes.status === 200 && shiftRestoreRes.data.data.currentShift === 'morning', 'Restored shift to morning (9AM - 6PM)');

    // 5. Hourly Task Logging & Statuses (Completed, Lunch Break)
    console.log('\n5️⃣ Testing Hourly Task Logging & Status Variations:');
    const today = new Date().toISOString().split('T')[0];
    
    // Log Completed Task
    const log1 = await request('/reports/hourly', {
      method: 'POST',
      body: {
        memberId: sampleMember.id,
        projectId: createdProj.id,
        projectName: createdProj.name,
        date: today,
        hourSlot: '09:00 AM - 10:00 AM',
        taskCount: 45,
        notes: 'Processed batch annotations',
        status: 'Completed'
      }
    });
    assert((log1.status === 200 || log1.status === 201) && log1.data.success, 'Logged Completed hour (45 tasks)');

    // Log Lunch Break
    const log2 = await request('/reports/hourly', {
      method: 'POST',
      body: {
        memberId: sampleMember.id,
        projectId: createdProj.id,
        projectName: createdProj.name,
        date: today,
        hourSlot: '01:00 PM - 02:00 PM',
        taskCount: 0,
        notes: 'Lunch Break',
        status: 'Lunch Break'
      }
    });
    assert((log2.status === 200 || log2.status === 201) && log2.data.success, 'Logged Lunch Break hour (0 tasks, Lunch status)');

    // 6. All-Day Leave Reflection
    console.log('\n6️⃣ Testing Full-Day Leave Reflection:');
    const leaveRes = await request('/reports/member-leave', {
      method: 'POST',
      body: {
        memberId: sampleMember.id,
        date: today,
        shift: 'morning'
      }
    });
    assert(leaveRes.status === 200 && leaveRes.data.success, 'Triggered All-Day Leave for member');

    // Verify matrix for all-day leave
    const matrixAfterLeave = await request(`/reports/matrix?date=${today}`);
    const memberMatrixRow = matrixAfterLeave.data.matrix.find(r => r.member.id === sampleMember.id);
    assert(memberMatrixRow !== undefined, 'Member found in matrix');
    const allSlotsLeave = Object.values(memberMatrixRow.hours).every(h => h && h.status === 'On Leave');
    assert(allSlotsLeave, 'All 9 hour slots reflect "On Leave" in database matrix');

    // 7. Admin Overview & Upgraded Velocity Graph
    console.log('\n7️⃣ Testing Admin Overview & Velocity Diagnostics:');
    const adminOverviewRes = await request(`/reports/admin-overview?date=${today}`);
    assert(adminOverviewRes.status === 200 && adminOverviewRes.data.success, 'Fetched Admin Dashboard Overview');
    const overview = adminOverviewRes.data.data;
    assert('hourlyVelocity' in overview && Array.isArray(overview.hourlyVelocity), 'Overview contains hourlyVelocity array');
    assert(overview.hourlyVelocity.length === 9, 'Hourly velocity contains all 9 slots of the active shift');
    assert('projectDistribution' in overview, 'Overview contains projectDistribution with goals and progress');
    assert('totalTasksToday' in overview || 'totalTasks' in overview, 'Overview has total tasks KPI');
    assert('activeMembers' in overview || 'activeMembersCount' in overview, 'Overview has active contributors count');

    // 8. Lead Overview
    console.log('\n8️⃣ Testing Team Lead Supervision Overview:');
    const leadOverviewRes = await request(`/reports/lead-overview?leadId=${sampleMember.id}&date=${today}`);
    assert(leadOverviewRes.status === 200 && leadOverviewRes.data.success, 'Lead Overview endpoint responds correctly');

    // 9. Excel & CSV Export Downloads
    console.log('\n9️⃣ Testing Excel & CSV Report Generation:');
    const excelRes = await request(`/reports/export-excel?date=${today}`);
    assert(excelRes.status === 200 && excelRes.headers.get('content-type')?.includes('spreadsheetml'), 'Export Excel (.xlsx) returns valid spreadsheet binary buffer');
    assert(excelRes.buffer && excelRes.buffer.length > 5000, `Excel file size is valid (${excelRes.buffer?.length} bytes)`);

    const csvHourlyRes = await request(`/reports/export-csv?type=hourly&date=${today}`);
    assert(csvHourlyRes.status === 200 && csvHourlyRes.text.includes('Log ID,Date,Hour Slot'), 'Export Hourly CSV contains valid structured report data');

    const csvDailyRes = await request(`/reports/export-csv?type=daily&date=${today}`);
    assert(csvDailyRes.status === 200 && csvDailyRes.text.includes('Date,Member Name,Member Role'), 'Export Daily Summary CSV contains table headers and data');

    // Clean up test project
    await request(`/projects/${createdProj.id}`, { method: 'DELETE' });

    console.log('\n====================================================');
    console.log(`🏁 TEST RUN FINISHED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
