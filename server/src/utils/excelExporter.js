import ExcelJS from 'exceljs';

const BORDER_STYLE = {
  top: { style: 'thin', color: { argb: 'CBD5E1' } },
  left: { style: 'thin', color: { argb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
  right: { style: 'thin', color: { argb: 'CBD5E1' } }
};

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: '0F172A' } // Dark Navy Corporate
};

const HEADER_FONT = {
  name: 'Calibri',
  size: 11,
  bold: true,
  color: { argb: 'FFFFFF' }
};

const ZEBRA_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'F8FAFC' } // Soft light slate
};

/**
 * Generate a professional executive Excel workbook for Daily and Hourly Work Reports
 */
export async function generateProfessionalExcelReport({
  date,
  shift = 'morning',
  summaries = [],
  matrixData = {},
  hourlyLogs = []
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LionIX Task Report';
  workbook.created = new Date();

  const isNightShift = shift === 'night';
  const shiftLabel = isNightShift ? 'Night Shift (8:00 PM – 5:00 AM)' : 'Morning Shift (9:00 AM – 6:00 PM)';

  // ==========================================
  // SHEET 1: DAILY SUMMARY & WORK DESCRIPTIONS
  // ==========================================
  const dailySheet = workbook.addWorksheet('Daily Work Report', {
    views: [{ showGridLines: true }]
  });

  // 1. Title Banner
  dailySheet.mergeCells('A1:I1');
  const titleCell = dailySheet.getCell('A1');
  titleCell.value = `LIONIX ENTERPRISE — DAILY WORK REPORT (${shiftLabel.toUpperCase()})`;
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: isNightShift ? '4F46E5' : 'D97706' }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  dailySheet.getRow(1).height = 36;

  // 2. Subtitle / Metadata Row
  dailySheet.mergeCells('A2:I2');
  const metaCell = dailySheet.getCell('A2');
  const totalTasksAll = summaries.reduce((acc, s) => acc + (Number(s.totalTasks) || 0), 0);
  const totalHoursAll = summaries.reduce((acc, s) => acc + (Number(s.hoursWorked) || 0), 0);
  metaCell.value = `Report Date: ${date || 'All Dates'}   |   Shift: ${shiftLabel}   |   Total Active Members: ${summaries.length}   |   Team Tasks Completed: ${totalTasksAll}   |   Total Hours: ${totalHoursAll} hrs`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, bold: true, color: { argb: '475569' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isNightShift ? 'E0E7FF' : 'FEF3C7' } };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  dailySheet.getRow(2).height = 24;

  // Empty Row
  dailySheet.addRow([]);

  // 3. Table Headers
  const dailyHeaders = [
    '#',
    'Date',
    'Team Member',
    'Role',
    'Department',
    'Total Tasks',
    'Hours Logged',
    'Avg Tasks/Hr',
    'Projects Breakdown',
    'Work Description & Task Details'
  ];

  const headerRow = dailySheet.addRow(dailyHeaders);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_STYLE;
  });

  // 4. Data Rows
  summaries.forEach((s, idx) => {
    const projBreakdownStr = (s.projectsList || []).map(p => `${p.projectName} (${p.tasks} tasks)`).join('; ');
    
    // Format descriptions handling Leave, Lunch, Task counts and work notes
    const descriptions = (s.logs || [])
      .filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0 || l.status === 'On Leave' || l.status === 'Lunch Break')
      .map(l => {
        const time = l.hourSlot ? l.hourSlot.split(' - ')[0] : '';
        const statusLower = (l.status || '').toLowerCase();
        const notes = (l.notes || '').trim();
        const notesLower = notes.toLowerCase();
        const tasks = Number(l.taskCount) || 0;

        if (statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'leave' || notesLower === 'on leave') {
          return `[${time}] [ON LEAVE]${notes && notesLower !== 'leave' && notesLower !== 'on leave' ? ` : ${notes}` : ''}`;
        }
        if (statusLower === 'lunch break' || statusLower === 'lunch' || notesLower === 'lunch' || notesLower === 'lunch break') {
          return `[${time}] [LUNCH BREAK]${notes && notesLower !== 'lunch' && notesLower !== 'lunch break' ? ` : ${notes}` : ''}`;
        }
        if (tasks > 0) {
          const noteStr = notes ? ` : ${notes}` : '';
          return `[${time}] ${tasks} tasks${noteStr}`;
        }
        if (notes) {
          return `[${time}] ${notes}`;
        }
        return `[${time}] Completed`;
      })
      .join('\n');

    const rowData = [
      idx + 1,
      s.date || date,
      s.memberName,
      s.memberRole,
      s.memberDepartment || 'IT',
      Number(s.totalTasks) || 0,
      `${s.hoursWorked || 0} hrs`,
      Number(s.avgTasksPerHour) || 0,
      projBreakdownStr || 'General',
      descriptions || 'Completed assigned work'
    ];

    const row = dailySheet.addRow(rowData);
    const isEven = idx % 2 === 0;
    row.height = descriptions.includes('\n') ? Math.max(30, (descriptions.split('\n').length) * 18) : 24;

    row.eachCell((cell, colNumber) => {
      cell.border = BORDER_STYLE;
      cell.font = { name: 'Calibri', size: 10 };
      if (!isEven) {
        cell.fill = ZEBRA_FILL;
      }

      // Column specific alignments
      if (colNumber === 1 || colNumber === 2 || colNumber === 5 || colNumber === 7) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (colNumber === 3) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '0F172A' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if (colNumber === 6) {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: isNightShift ? '4F46E5' : 'D97706' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '#,##0';
      } else if (colNumber === 8) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '0284C7' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (colNumber === 10) {
        cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // 5. Total Summary Row
  const totalRowIndex = dailySheet.rowCount + 1;
  const totalRow = dailySheet.addRow([
    'TOTAL',
    '',
    'All Team Members',
    '—',
    'IT',
    totalTasksAll,
    `${totalHoursAll} hrs`,
    summaries.length > 0 ? (totalTasksAll / summaries.length).toFixed(1) : '0.0',
    'Team Total Output',
    'Aggregated output across all members'
  ]);
  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
    cell.border = {
      top: { style: 'medium', color: { argb: '0F172A' } },
      bottom: { style: 'double', color: { argb: '0F172A' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } }
    };
    if (colNumber === 6) {
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: isNightShift ? '4338CA' : 'B45309' } };
    } else if (colNumber === 7 || colNumber === 1 || colNumber === 5) {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    }
  });

  // Column Widths for Sheet 1
  dailySheet.columns = [
    { width: 6 },   // #
    { width: 14 },  // Date
    { width: 26 },  // Team Member
    { width: 22 },  // Role
    { width: 14 },  // Department
    { width: 14 },  // Total Tasks
    { width: 14 },  // Hours Logged
    { width: 14 },  // Avg Tasks/Hr
    { width: 34 },  // Projects Breakdown
    { width: 55 }   // Work Description & Task Details
  ];

  // ==========================================
  // SHEET 2: HOURLY WORK MATRIX
  // ==========================================
  if (matrixData.matrix && matrixData.matrix.length > 0) {
    const matrixSheet = workbook.addWorksheet('Hourly Work Matrix', {
      views: [{ showGridLines: true }]
    });

    const standardHours = matrixData.allHours || [];

    // 1. Matrix Title
    matrixSheet.mergeCells(`A1:${String.fromCharCode(65 + standardHours.length + 3)}1`);
    const mTitle = matrixSheet.getCell('A1');
    mTitle.value = `LIONIX ENTERPRISE — ${shiftLabel.toUpperCase()} HOURLY WORK MATRIX`;
    mTitle.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFF' } };
    mTitle.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: isNightShift ? '4338CA' : '0284C7' }
    };
    mTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    matrixSheet.getRow(1).height = 34;

    // 2. Matrix Headers
    const mHeaders = ['#', 'Team Member', 'Role', ...standardHours.map(h => h.split(' - ')[0]), 'Total Tasks'];
    const mHeaderRow = matrixSheet.addRow(mHeaders);
    mHeaderRow.height = 28;
    mHeaderRow.eachCell(cell => {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = BORDER_STYLE;
    });

    // 3. Matrix Rows
    matrixData.matrix.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const hourCells = standardHours.map(h => {
        const log = row.hours ? row.hours[h] : null;
        if (!log) return '-';

        const statusLower = (log.status || '').toLowerCase();
        const notes = (log.notes || '').trim();
        const notesLower = notes.toLowerCase();
        const tasks = Number(log.taskCount) || 0;

        if (statusLower === 'on leave' || statusLower === 'leave' || notesLower === 'leave' || notesLower === 'on leave') {
          return notes && notesLower !== 'leave' && notesLower !== 'on leave' ? `[LEAVE]\n${notes}` : 'LEAVE';
        }
        if (statusLower === 'lunch break' || statusLower === 'lunch' || notesLower === 'lunch' || notesLower === 'lunch break') {
          return notes && notesLower !== 'lunch' && notesLower !== 'lunch break' ? `[LUNCH]\n${notes}` : 'LUNCH';
        }
        if (tasks > 0) {
          const noteStr = notes ? `\n${notes}` : '';
          return `${tasks} tasks${noteStr}`;
        }
        if (notes) {
          return notes; // Only work description clearly, without "0 tasks"!
        }
        return '-';
      });

      const rowValues = [
        idx + 1,
        row.member.name,
        row.member.role || 'Member',
        ...hourCells,
        row.totalTasks || 0
      ];

      const mRow = matrixSheet.addRow(rowValues);
      mRow.height = 32;

      mRow.eachCell((cell, colNumber) => {
        cell.border = BORDER_STYLE;
        cell.font = { name: 'Calibri', size: 9.5 };
        if (!isEven) cell.fill = ZEBRA_FILL;

        const cellVal = String(cell.value || '');
        if (cellVal.includes('LEAVE')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'E11D48' } }; // Rose red
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4E6' } }; // Soft light rose
        } else if (cellVal.includes('LUNCH')) {
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'D97706' } }; // Amber
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Soft light amber
        }

        if (colNumber === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 2) {
          cell.font = { name: 'Calibri', size: 10, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === mHeaders.length) {
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: isNightShift ? '4F46E5' : 'D97706' } };
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
      });
    });

    // Column Widths for Sheet 2
    matrixSheet.columns = [
      { width: 5 },   // #
      { width: 24 },  // Member
      { width: 20 },  // Role
      ...standardHours.map(() => ({ width: 16 })),
      { width: 14 }   // Total Tasks
    ];
  }

  return workbook;
}
