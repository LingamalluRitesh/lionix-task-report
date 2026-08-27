import express from 'express';
import { db } from '../db/database.js';
import { generateProfessionalExcelReport } from '../utils/excelExporter.js';

const router = express.Router();

// Morning Shift: 9:00 AM to 6:00 PM
export const MORNING_HOURS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM'
];

// Night Shift: 8:00 PM to 5:00 AM
export const NIGHT_HOURS = [
  '08:00 PM - 09:00 PM',
  '09:00 PM - 10:00 PM',
  '10:00 PM - 11:00 PM',
  '11:00 PM - 12:00 AM',
  '12:00 AM - 01:00 AM',
  '01:00 AM - 02:00 AM',
  '02:00 AM - 03:00 AM',
  '03:00 AM - 04:00 AM',
  '04:00 AM - 05:00 AM'
];

export function getHoursForShift(shift = 'morning') {
  return shift === 'night' ? NIGHT_HOURS : MORNING_HOURS;
}

// GET settings (Daily Task Goal & Current Shift)
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update settings (Daily Task Goal & Current Shift)
router.put('/settings', async (req, res) => {
  try {
    const { dailyTaskGoal, currentShift } = req.body;
    const settings = await db.updateSettings({ dailyTaskGoal, currentShift });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST mark member full day on leave
router.post('/member-leave', async (req, res) => {
  try {
    const { memberId, date, shift } = req.body;
    if (!memberId || !date) {
      return res.status(400).json({ success: false, error: 'memberId and date are required' });
    }
    const settings = await db.getSettings();
    const activeShift = shift || settings.currentShift || 'morning';
    const hours = getHoursForShift(activeShift);

    await db.markMemberDayOnLeave(memberId, date, hours);
    res.json({ success: true, message: `Member marked On Leave for all day on ${date}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET hourly logs with filters
router.get('/hourly', async (req, res) => {
  try {
    const { date, memberId, projectId, startDate, endDate } = req.query;
    const logs = await db.getHourlyLogs({ date, memberId, projectId, startDate, endDate });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET hourly matrix for a specific date & shift
router.get('/matrix', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const leadId = req.query.leadId;
    const requestedShift = req.query.shift;

    const settings = await db.getSettings();
    const activeShift = requestedShift || settings.currentShift || 'morning';
    const standardHours = getHoursForShift(activeShift);

    let members = await db.getMembers(true);
    let logs = await db.getHourlyLogs({ date });

    // Filter by lead if requested
    if (leadId) {
      const assignedIds = await db.getTeamAssignments(leadId);
      const relevantIds = Array.from(new Set([leadId, ...assignedIds]));
      members = members.filter(m => relevantIds.includes(m.id));
      logs = logs.filter(l => relevantIds.includes(l.memberId));
    }

    // Collect any extra custom hours logged by employees
    const customHours = new Set();
    logs.forEach(l => {
      if (!standardHours.includes(l.hourSlot)) {
        customHours.add(l.hourSlot);
      }
    });

    const allHours = [...standardHours, ...Array.from(customHours).sort()];

    // Build matrix
    const matrix = members.map(member => {
      const memberLogs = logs.filter(l => l.memberId === member.id);
      const hourMap = {};
      let totalTasks = 0;
      let hoursWorked = 0;

      allHours.forEach(hour => {
        const log = memberLogs.find(l => l.hourSlot === hour);
        if (log) {
          hourMap[hour] = log;
          totalTasks += Number(log.taskCount) || 0;
          hoursWorked += 1;
        } else {
          hourMap[hour] = null;
        }
      });

      return {
        member,
        hours: hourMap,
        totalTasks,
        hoursWorked,
        avgRate: hoursWorked > 0 ? (totalTasks / hoursWorked).toFixed(1) : '0.0'
      };
    });

    res.json({
      success: true,
      date,
      shift: activeShift,
      allHours,
      matrix
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create or upsert hourly task log
router.post('/hourly', async (req, res) => {
  try {
    const { memberId, projectId, projectName, date, hourSlot, taskCount, notes, status } = req.body;

    if (!memberId || !date || !hourSlot) {
      return res.status(400).json({
        success: false,
        error: 'memberId, date, and hourSlot are required fields'
      });
    }

    const log = await db.createOrUpdateHourlyLog({
      memberId,
      projectId,
      projectName,
      date,
      hourSlot,
      taskCount: taskCount !== undefined ? taskCount : 0,
      notes,
      status
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT edit existing hourly log
router.put('/hourly/:id', async (req, res) => {
  try {
    const updated = await db.updateHourlyLog(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Hourly log not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE hourly log
router.delete('/hourly/:id', async (req, res) => {
  try {
    const deleted = await db.deleteHourlyLog(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Hourly log not found' });
    }
    res.json({ success: true, message: 'Hourly log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET daily summary aggregated report
router.get('/daily-summary', async (req, res) => {
  try {
    const { date, startDate, endDate, memberId, leadId } = req.query;
    let summaries = await db.getDailySummary({ date, startDate, endDate, memberId });

    if (leadId) {
      const assignedIds = await db.getTeamAssignments(leadId);
      const relevantIds = Array.from(new Set([leadId, ...assignedIds]));
      summaries = summaries.filter(s => relevantIds.includes(s.memberId));
    }

    res.json({ success: true, count: summaries.length, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET lead overview (Work progress for assigned teammates)
router.get('/lead-overview', async (req, res) => {
  try {
    const { leadId, date, startDate, endDate } = req.query;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'leadId is required' });
    }
    const overview = await db.getLeadOverview(leadId, { date, startDate, endDate });
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET admin dashboard overview
router.get('/admin-overview', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const overview = await db.getAdminOverview({ date, startDate, endDate });
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET export professional styled Microsoft Excel (.xlsx) report
router.get('/export-excel', async (req, res) => {
  try {
    const { date, startDate, endDate, leadId, shift } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const settings = await db.getSettings();
    const activeShift = shift || settings.currentShift || 'morning';
    const standardHours = getHoursForShift(activeShift);

    let [summaries, members, logs] = await Promise.all([
      db.getDailySummary({ date: targetDate, startDate, endDate }),
      db.getMembers(true),
      db.getHourlyLogs({ date: targetDate, startDate, endDate })
    ]);

    // If Team Lead / Coordinator is exporting, filter strictly to their assigned team
    if (leadId) {
      const assignedIds = await db.getTeamAssignments(leadId);
      const relevantIds = Array.from(new Set([leadId, ...assignedIds]));
      summaries = summaries.filter(s => relevantIds.includes(s.memberId));
      members = members.filter(m => relevantIds.includes(m.id));
      logs = logs.filter(l => relevantIds.includes(l.memberId));
    }

    // Build matrix data for Sheet 2
    const customHours = new Set();
    logs.forEach(l => {
      if (!standardHours.includes(l.hourSlot)) {
        customHours.add(l.hourSlot);
      }
    });
    const allHours = [...standardHours, ...Array.from(customHours).sort()];

    const matrix = members.map(member => {
      const memberLogs = logs.filter(l => l.memberId === member.id);
      const hourMap = {};
      let totalTasks = 0;
      let hoursWorked = 0;

      allHours.forEach(hour => {
        const log = memberLogs.find(l => l.hourSlot === hour);
        if (log) {
          hourMap[hour] = log;
          totalTasks += Number(log.taskCount) || 0;
          hoursWorked += 1;
        } else {
          hourMap[hour] = null;
        }
      });

      return {
        member,
        hours: hourMap,
        totalTasks,
        hoursWorked
      };
    });

    const workbook = await generateProfessionalExcelReport({
      date: targetDate,
      shift: activeShift,
      summaries,
      matrixData: { allHours, matrix },
      hourlyLogs: logs
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=LionIX-${activeShift}-${leadId ? 'TeamLead' : 'Executive'}-${targetDate}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET export reports to CSV
router.get('/export-csv', async (req, res) => {
  try {
    const { type, date, startDate, endDate, leadId } = req.query;
    const isDaily = type === 'daily';

    if (isDaily) {
      let summaries = await db.getDailySummary({ date, startDate, endDate });

      if (leadId) {
        const assignedIds = await db.getTeamAssignments(leadId);
        const relevantIds = Array.from(new Set([leadId, ...assignedIds]));
        summaries = summaries.filter(s => relevantIds.includes(s.memberId));
      }

      let csv = 'Date,Member Name,Member Role,Department,Total Tasks,Hours Worked,Avg Tasks/Hour,Projects Breakdown,Work Description / Task Details\n';
      summaries.forEach(s => {
        const projBreakdownStr = s.projectsList.map(p => `${p.projectName} (${p.tasks} tasks)`).join('; ');
        
        // Collect and format all work descriptions logged throughout the day
        const descriptions = (s.logs || [])
          .filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0 || l.status === 'On Leave' || l.status === 'Lunch Break')
          .map(l => {
            const time = l.hourSlot ? l.hourSlot.split(' - ')[0] : '';
            const statusLower = (l.status || '').toLowerCase();
            const notes = (l.notes || '').trim().replace(/"/g, '""');
            const notesLower = notes.toLowerCase();
            const tasks = Number(l.taskCount) || 0;
            const proj = l.projectName || 'General';

            if (statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'leave' || notesLower === 'on leave') {
              return `[${time}] [ON LEAVE]${notes && notesLower !== 'leave' && notesLower !== 'on leave' ? ` - ${notes}` : ''}`;
            }
            if (statusLower === 'lunch break' || statusLower === 'lunch' || notesLower === 'lunch' || notesLower === 'lunch break') {
              return `[${time}] [LUNCH BREAK]${notes && notesLower !== 'lunch' && notesLower !== 'lunch break' ? ` - ${notes}` : ''}`;
            }
            if (tasks > 0) {
              const noteStr = notes ? ` - ${notes}` : '';
              return `[${time} ${proj}] ${tasks} tasks${noteStr}`;
            }
            if (notes) {
              return `[${time} ${proj}] ${notes}`;
            }
            return `[${time} ${proj}] Completed`;
          })
          .join('; ');

        const safeDesc = descriptions || 'Completed assigned daily tasks';
        csv += `"${s.date}","${s.memberName}","${s.memberRole}","${s.memberDepartment || 'IT'}",${s.totalTasks},${s.hoursWorked},${s.avgTasksPerHour},"${projBreakdownStr}","${safeDesc}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=lionix-daily-workreport-${date || 'all'}.csv`);
      return res.send(csv);
    } else {
      let logs = await db.getHourlyLogs({ date, startDate, endDate });

      if (leadId) {
        const assignedIds = await db.getTeamAssignments(leadId);
        const relevantIds = Array.from(new Set([leadId, ...assignedIds]));
        logs = logs.filter(l => relevantIds.includes(l.memberId));
      }

      let csv = 'Log ID,Date,Hour Slot,Member Name,Project Name,Task Count,Status,Notes\n';
      logs.forEach(l => {
        const safeNotes = (l.notes || '').replace(/"/g, '""');
        csv += `"${l.id}","${l.date}","${l.hourSlot}","${l.memberName}","${l.projectName}",${l.taskCount},"${l.status}","${safeNotes}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=lionix-hourly-workreport-${date || 'all'}.csv`);
      return res.send(csv);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
