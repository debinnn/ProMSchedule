import React, { useState } from 'react';
import { formatDisplayDate, parseDate, getNextDay } from '../utils/dateHelpers';
import { pasteScheduleToDateRange } from '../firebase/firestore';

const CopyPasteScheduleModal = ({ copiedSchedule, sourceDate, onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [previewDates, setPreviewDates] = useState([]);

  const handlePreview = () => {
    setError('');
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      setError('End date must be after start date');
      return;
    }

    // Generate preview of weekdays
    const dates = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const date = parseDate(currentDate);
      const dayOfWeek = date.getDay();
      
      // Only include weekdays (1-5, Monday to Friday)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push({
          dateStr: currentDate,
          display: formatDisplayDate(date),
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
        });
      }
      
      currentDate = getNextDay(currentDate);
    }

    if (dates.length === 0) {
      setError('No weekdays found in the selected range');
      return;
    }

    setPreviewDates(dates);
  };

  const handlePaste = () => {
    if (previewDates.length === 0) {
      setError('Please preview the dates first');
      return;
    }

    const dateStrings = previewDates.map(d => d.dateStr);
    pasteScheduleToDateRange(copiedSchedule, dateStrings);
    
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Paste Schedule</h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm font-medium text-blue-900">
            Copying from: {formatDisplayDate(parseDate(sourceDate))}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {Object.values(copiedSchedule.shifts).flat().length} member assignments
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreviewDates([]);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPreviewDates([]);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handlePreview}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            Preview Dates
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {previewDates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Schedule will be pasted to {previewDates.length} weekday{previewDates.length !== 1 ? 's' : ''}:
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="space-y-1">
                {previewDates.map((date) => (
                  <div key={date.dateStr} className="text-sm text-gray-700">
                    {date.dayName}, {date.display}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Note: Weekends (Saturday & Sunday) are automatically excluded
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          {previewDates.length > 0 && (
            <button
              onClick={handlePaste}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Paste to {previewDates.length} Day{previewDates.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyPasteScheduleModal;
