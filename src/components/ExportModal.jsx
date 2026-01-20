import React, { useState } from 'react';
import { getTodayString, parseDate, formatDate, getNextDay } from '../utils/dateHelpers';
import { getScheduleForDate } from '../firebase/firestore';
import ExcelJS from 'exceljs';

const ExportModal = ({ onClose }) => {
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const shiftColors = {
    JPN: { bg: 'FFE3F2FD', text: '001976D2' },      // Light blue
    IST: { bg: 'FFF3E5F5', text: '004A148C' },      // Light purple
    CET_EARLY: { bg: 'FFF1F8E9', text: '00558B2F' }, // Light green
    CET_LATE: { bg: 'FFFBE9E7', text: '00D84315' },  // Light orange
    US_EARLY: { bg: 'FFF3E5F5', text: '006A1B9A' },  // Light pink
    US_LATE: { bg: 'FFFFF8E1', text: '00F57F17' }    // Light yellow
  };

  const shiftLabels = {
    JPN: 'JPN (6:00 - 15:00)',
    IST: 'IST (9:00 - 18:00)',
    CET_EARLY: 'CET Early (11:00 - 20:00)',
    CET_LATE: 'CET Late (14:00 - 23:00)',
    US_EARLY: 'US Early (16:00 - 01:00)',
    US_LATE: 'US Late (19:00 - 04:00)'
  };

  const handleExport = async () => {
    setError('');
    setIsExporting(true);

    try {
      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (start > end) {
        setError('Start date must be before or equal to end date');
        setIsExporting(false);
        return;
      }

      // Calculate number of days
      const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (daysDiff > 90) {
        setError('Maximum 90 days can be exported at once');
        setIsExporting(false);
        return;
      }

      // Load all schedules for the date range
      const schedules = {};
      let currentDate = startDate;
      while (currentDate <= endDate) {
        schedules[currentDate] = await getScheduleForDate(currentDate);
        currentDate = getNextDay(currentDate);
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Team Schedule');

      // Set column widths
      worksheet.columns = [
        { width: 15 },  // Date
        { width: 20 },  // Shift
        { width: 8 },   // Slot
        { width: 20 },  // Member Name
        { width: 25 }   // Assignment
      ];

      // Add header row
      const headerRow = worksheet.addRow(['Date', 'Shift', 'Slot', 'Member', 'Assignment']);
      headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 25;

      // Add borders to header
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add data rows
      currentDate = startDate;
      while (currentDate <= endDate) {
        const schedule = schedules[currentDate];
        const dateObj = parseDate(currentDate);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });

        let hasData = false;

        // Add shifts
        Object.entries(schedule.shifts).forEach(([shiftType, members]) => {
          if (members.length > 0) {
            hasData = true;
            members.forEach((member) => {
              const row = worksheet.addRow([
                dateStr,
                shiftLabels[shiftType],
                member.slot || '',
                member.memberName || '',
                member.assignment || ''
              ]);

              // Apply shift-specific colors
              row.eachCell((cell, colNumber) => {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: shiftColors[shiftType].bg }
                };
                cell.font = { color: { argb: shiftColors[shiftType].text } };
                cell.border = {
                  top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                  left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                  bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                  right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                };
                cell.alignment = { vertical: 'middle' };
              });
            });
          }
        });

        // Add on-leave members
        if (schedule.onLeave && schedule.onLeave.length > 0) {
          hasData = true;
          schedule.onLeave.forEach((leave) => {
            const row = worksheet.addRow([
              dateStr,
              '🏖️ ON LEAVE',
              '',
              leave.memberName || '',
              leave.reason || ''
            ]);

            // Apply on-leave styling
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF9C4' }
              };
              cell.font = { color: { argb: 'FFF57F17' }, italic: true };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
              };
              cell.alignment = { vertical: 'middle' };
            });
          });
        }

        // Add empty row if no data for the day
        if (!hasData) {
          const row = worksheet.addRow([
            dateStr,
            'No schedule',
            '',
            '',
            ''
          ]);
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F5F5' }
            };
            cell.font = { color: { argb: 'FF9E9E9E' }, italic: true };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
              right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            };
            cell.alignment = { vertical: 'middle' };
          });
        }

        currentDate = getNextDay(currentDate);
      }

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-schedule-${startDate}-to-${endDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export schedule. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Export Schedule</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The schedule will be exported as an Excel file (.xlsx) with:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
              <li>• Color-coded shifts</li>
              <li>• Formatted cells with borders</li>
              <li>• Member assignments and slots</li>
              <li>• On-leave information</li>
              <li>• Maximum 90 days per export</li>
            </ul>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>📥 Export to Excel</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
