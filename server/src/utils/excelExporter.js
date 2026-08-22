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
export async function generateProfessionalExcelReport({ date, summaries = [], matrixData = {}, hourlyLogs = [] }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LionIX Task Report';
  workbook.created = new Date();

  // ==========================================
  // SHEET 1: DAILY SUMMARY & WORK DESCRIPTIONS
  // ==========================================
  const dailySheet = workbook.addWorksheet('Daily Work Report', {
    views: [{ showGridLines: true }]
  });

  // 1. Title Banner
  dailySheet.mergeCells('A1:I1');
  const titleCell = dailySheet.getCell('A1');
  titleCell.value = 'LIONIX ENTERPRISE — DAILY TASK & WORK REPORT';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } }; // Amber 600
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  dailySheet.getRow(1).height = 36;

  // 2. Subtitle / Metadata Row
  dailySheet.mergeCells('A2:I2');
  const metaCell = dailySheet.getCell('A2');
  const totalTasksAll = summaries.reduce((acc, s) => acc + (Number(s.totalTasks) || 0), 0);
  const totalHoursAll = summaries.reduce((acc, s) => acc + (Number(s.hoursWorked) || 0), 0);
  metaCell.value = `Report Date: ${date || 'All Dates'}   |   Total Active Members: ${summaries.length}   |   Total Team Tasks Completed: ${totalTasksAll}   |   Total Hours: ${totalHoursAll} hrs`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, bold: true, color: { argb: '475569' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } }; // Light Amber
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
    
    // Detailed notes
    const descriptions = (s.logs || [])
      .filter(l => (l.notes && l.notes.trim().length > 0) || Number(l.taskCount) > 0)
      .map(l => {
        const time = l.hourSlot ? l.hourSlot.split(' - ')[0] : '';
        const taskStr = `${l.taskCount} tasks`;
        const noteStr = l.notes ? ` : ${l.notes}` : '';
        return `[${time}] ${taskStr}${noteStr}`;
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
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'D97706' } };
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
    'Aggregated daily output across all members'
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
      cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'B45309' } };
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
  // SHEET 2: 9:00 AM – 6:00 PM HOURLY MATRIX
  // ==========================================
  if (matrixData.matrix && matrixData.matrix.length > 0) {
    const matrixSheet = workbook.addWorksheet('Hourly Work Matrix', {
      views: [{ showGridLines: true }]
    });

    // 1. Matrix Title
    matrixSheet.mergeCells('A1:L1');
    const mTitle = matrixSheet.getCell('A1');
    mTitle.value = 'LIONIX ENTERPRISE — 9:00 AM TO 6:00 PM HOURLY WORK MATRIX';
    mTitle.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFF' } };
    mTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0284C7' } }; // Sky 600
    mTitle.alignment = { vertical: 'middle', horizontal: 'center' };
    matrixSheet.getRow(1).height = 34;

    // 2. Matrix Headers
    const standardHours = matrixData.allHours || [
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
        const tasks = Number(log.taskCount) || 0;
        const notes = log.notes ? `\n(${log.notes})` : '';
        return `${tasks} tasks${notes}`;
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

        if (colNumber === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 2) {
          cell.font = { name: 'Calibri', size: 10, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === mHeaders.length) {
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'D97706' } };
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
