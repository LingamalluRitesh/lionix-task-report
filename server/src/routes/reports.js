import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Standard 9:00 AM to 6:00 PM Working Hours
const STANDARD_HOURS = [
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

// GET hourly logs with filters
router.get('/hourly', (req, res) => {
  try {
    const { date, memberId, projectId, startDate, endDate } = req.query;
    const logs = db.getHourlyLogs({ date, memberId, projectId, startDate, endDate });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET hourly matrix for a specific date (all members vs 9 AM to 6 PM hours)
router.get('/matrix', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const members = db.getMembers(true);
    const logs = db.getHourlyLogs({ date });

    // Collect any extra custom hours
    const customHours = new Set();
    logs.forEach(l => {
      if (!STANDARD_HOURS.includes(l.hourSlot)) {
        customHours.add(l.hourSlot);
      }
    });

    const allHours = [...STANDARD_HOURS, ...Array.from(customHours).sort()];

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
      allHours,
      matrix
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create or upsert hourly task log
router.post('/hourly', (req, res) => {
  try {
    const { memberId, projectId, projectName, date, hourSlot, taskCount, notes, status } = req.body;

    if (!memberId || !date || !hourSlot) {
      return res.status(400).json({
        success: false,
        error: 'memberId, date, and hourSlot are required fields'
      });
    }

    const log = db.createOrUpdateHourlyLog({
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
router.put('/hourly/:id', (req, res) => {
  try {
    const updated = db.updateHourlyLog(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Hourly log not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE hourly log
router.delete('/hourly/:id', (req, res) => {
  try {
    const deleted = db.deleteHourlyLog(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Hourly log not found' });
    }
    res.json({ success: true, message: 'Hourly log deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET daily summary aggregated report
router.get('/daily-summary', (req, res) => {
  try {
    const { date, startDate, endDate, memberId } = req.query;
    const summaries = db.getDailySummary({ date, startDate, endDate, memberId });
    res.json({ success: true, count: summaries.length, data: summaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET admin dashboard overview
router.get('/admin-overview', (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const overview = db.getAdminOverview({ date, startDate, endDate });
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET export reports to CSV
router.get('/export-csv', (req, res) => {
  try {
    const { type, date, startDate, endDate } = req.query;
    const isDaily = type === 'daily';

    if (isDaily) {
      const summaries = db.getDailySummary({ date, startDate, endDate });
      let csv = 'Date,Member Name,Member Role,Total Tasks,Hours Worked,Avg Tasks/Hour,Projects Breakdown\n';
      summaries.forEach(s => {
        const projBreakdownStr = s.projectsList.map(p => `${p.projectName} (${p.tasks} tasks)`).join('; ');
        csv += `"${s.date}","${s.memberName}","${s.memberRole}",${s.totalTasks},${s.hoursWorked},${s.avgTasksPerHour},"${projBreakdownStr}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=lionix-daily-workreport-${date || 'all'}.csv`);
      return res.send(csv);
    } else {
      const logs = db.getHourlyLogs({ date, startDate, endDate });
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
