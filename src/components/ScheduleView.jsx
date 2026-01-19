import React, { useState, useEffect } from 'react';
import { 
  getTodayString, 
  formatDisplayDate, 
  formatDayOfWeek,
  getNextDay, 
  getPreviousDay,
  getWeekDays,
  getNextWeek,
  getPreviousWeek,
  getWeekLabel,
  getMonthDays,
  getNextMonth,
  getPreviousMonth,
  getMonthLabel,
  parseDate,
  formatDate,
  isToday,
  formatShortDate,
  getShiftLabel
} from '../utils/dateHelpers';
import { getScheduleForDate, getEmptyShifts, getUnassignedSlots } from '../firebase/firestore';
import ShiftCard from './ShiftCard';
import OnLeaveSection from './OnLeaveSection';
import AddMemberModal from './AddMemberModal';
import EditMemberModal from './EditMemberModal';
import CopyPasteScheduleModal from './CopyPasteScheduleModal';
import { useAuth } from '../context/AuthContext';

const ScheduleView = ({ view, setView, selectedMember, teamMembers }) => {
  const { isEditor } = useAuth();
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [schedule, setSchedule] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [emptyShifts, setEmptyShifts] = useState([]);
  const [unassignedSlots, setUnassignedSlots] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSchedule();
  }, [currentDate, refreshKey]);

  const loadSchedule = async () => {
    const data = await getScheduleForDate(currentDate);
    setSchedule(data);
    const empty = await getEmptyShifts(currentDate);
    setEmptyShifts(empty);
    const unassigned = await getUnassignedSlots(currentDate);
    setUnassignedSlots(unassigned);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAddMember = (shiftType) => {
    setSelectedShift(shiftType);
    setShowAddModal(true);
  };

  const handleEditMember = (shiftType, member) => {
    setSelectedShift(shiftType);
    setEditingMember(member);
    setShowEditModal(true);
  };

  const handlePasteSchedule = () => {
    setShowPasteModal(true);
  };

  const filterByMember = (members) => {
    if (!selectedMember) return members;
    return members.filter(m => m.memberId === parseInt(selectedMember));
  };

  const filterOnLeaveByMember = (onLeave) => {
    if (!selectedMember) return onLeave;
    return onLeave.filter(l => l.memberId === parseInt(selectedMember));
  };

  // Helper function to check empty shifts from schedule data
  const getEmptyShiftsFromSchedule = (scheduleData) => {
    const emptyShifts = [];
    Object.entries(scheduleData.shifts).forEach(([shiftType, members]) => {
      if (members.length === 0) {
        emptyShifts.push(shiftType);
      }
    });
    return emptyShifts;
  };

  // Helper function to check unassigned slots from schedule data
  const getUnassignedSlotsFromSchedule = (scheduleData) => {
    const assignedSlots = new Set();
    Object.values(scheduleData.shifts).forEach(shift => {
      shift.forEach(member => {
        if (member.slot) {
          assignedSlots.add(member.slot);
        }
      });
    });
    const unassigned = [];
    for (let i = 1; i <= 6; i++) {
      if (!assignedSlots.has(i)) {
        unassigned.push(i);
      }
    }
    return unassigned;
  };

  // Daily View
  const renderDailyView = () => {
    if (!schedule) return null;

    return (
      <div className="space-y-6">
        {(emptyShifts.length > 0 || unassignedSlots.length > 0) && (
          <div className="space-y-2">
            {emptyShifts.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <span className="text-red-800 font-medium">⚠ Uncovered Shifts:</span>
                  <span className="ml-2 text-red-700">
                    {emptyShifts.map(shift => getShiftLabel(shift)).join(', ')}
                  </span>
                </div>
              </div>
            )}
            {unassignedSlots.length > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
                <div className="flex items-center">
                  <span className="text-amber-800 font-medium">⚠ Unassigned Slots:</span>
                  <span className="ml-2 text-amber-700">
                    {unassignedSlots.map(slot => `Slot ${slot}`).join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {formatDisplayDate(parseDate(currentDate))}
            <span className="text-base font-normal text-gray-600 ml-2">
              ({formatDayOfWeek(parseDate(currentDate))})
            </span>
          </h2>
          <div className="flex space-x-2">
            {isEditor() && (
              <button
                onClick={handlePasteSchedule}
                className="px-4 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50"
                title="Paste this day's schedule to a range of dates"
              >
                📄 Paste to Range
              </button>
            )}
            <button
              onClick={() => setCurrentDate(getPreviousDay(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Previous Day
            </button>
            <button
              onClick={() => setCurrentDate(getTodayString())}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(getNextDay(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next Day →
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <ShiftCard
            shiftType="JPN"
            members={filterByMember(schedule.shifts.JPN)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('JPN')}
            onEditMember={(member) => handleEditMember('JPN', member)}
            onUpdate={handleRefresh}
          />
          <ShiftCard
            shiftType="IST"
            members={filterByMember(schedule.shifts.IST)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('IST')}
            onEditMember={(member) => handleEditMember('IST', member)}
            onUpdate={handleRefresh}
          />
          <ShiftCard
            shiftType="CET_EARLY"
            members={filterByMember(schedule.shifts.CET_EARLY)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('CET_EARLY')}
            onEditMember={(member) => handleEditMember('CET_EARLY', member)}
            onUpdate={handleRefresh}
          />
          <ShiftCard
            shiftType="CET_LATE"
            members={filterByMember(schedule.shifts.CET_LATE)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('CET_LATE')}
            onEditMember={(member) => handleEditMember('CET_LATE', member)}
            onUpdate={handleRefresh}
          />
          <ShiftCard
            shiftType="US_EARLY"
            members={filterByMember(schedule.shifts.US_EARLY)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('US_EARLY')}
            onEditMember={(member) => handleEditMember('US_EARLY', member)}
            onUpdate={handleRefresh}
          />
          <ShiftCard
            shiftType="US_LATE"
            members={filterByMember(schedule.shifts.US_LATE)}
            dateStr={currentDate}
            onAddMember={() => handleAddMember('US_LATE')}
            onEditMember={(member) => handleEditMember('US_LATE', member)}
            onUpdate={handleRefresh}
          />

          <div className="border-t border-gray-300 pt-4">
            <OnLeaveSection
              dateStr={currentDate}
              onLeave={filterOnLeaveByMember(schedule.onLeave)}
              onUpdate={handleRefresh}
            />
          </div>
        </div>
      </div>
    );
  };

  // Weekly View
  const renderWeeklyView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getWeekLabel(currentDate)}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(getPreviousWeek(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Previous Week
            </button>
            <button
              onClick={() => setCurrentDate(getTodayString())}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentDate(getNextWeek(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next Week →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {weekDays.map((day) => (
                  <th
                    key={formatDate(day)}
                    className={`border border-gray-200 px-4 py-3 text-left text-sm font-semibold ${
                      isToday(day) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>{formatDayOfWeek(day)}</div>
                    <div className="text-gray-600 font-normal">{formatShortDate(day)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDays.map((day) => {
                  const dateStr = formatDate(day);
                  // Note: This will be empty for dates not yet loaded - acceptable for now
                  const daySchedule = { shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] }, onLeave: [] };
                  const emptyShifts = getEmptyShiftsFromSchedule(daySchedule);
                  const unassignedSlots = getUnassignedSlotsFromSchedule(daySchedule);
                  const allMembers = [
                    ...daySchedule.shifts.JPN.map(m => ({ ...m, shift: 'JPN' })),
                    ...daySchedule.shifts.IST.map(m => ({ ...m, shift: 'IST' })),
                    ...daySchedule.shifts.CET_EARLY.map(m => ({ ...m, shift: 'CET_EARLY' })),
                    ...daySchedule.shifts.CET_LATE.map(m => ({ ...m, shift: 'CET_LATE' })),
                    ...daySchedule.shifts.US_EARLY.map(m => ({ ...m, shift: 'US_EARLY' })),
                    ...daySchedule.shifts.US_LATE.map(m => ({ ...m, shift: 'US_LATE' }))
                  ];

                  const filteredMembers = filterByMember(allMembers);
                  const filteredOnLeave = filterOnLeaveByMember(daySchedule.onLeave);

                  return (
                    <td
                      key={dateStr}
                      className={`border border-gray-200 px-2 py-2 align-top ${
                        isToday(day) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        {(emptyShifts.length > 0 || unassignedSlots.length > 0) && (
                          <div className="bg-red-100 border border-red-300 p-1 rounded text-center">
                            <span 
                              className="text-red-700 font-bold" 
                              title={[
                                emptyShifts.length > 0 ? `Uncovered: ${emptyShifts.map(s => getShiftLabel(s)).join(', ')}` : '',
                                unassignedSlots.length > 0 ? `Unassigned Slots: ${unassignedSlots.join(', ')}` : ''
                              ].filter(Boolean).join(' | ')}
                            >
                              ⚠
                            </span>
                          </div>
                        )}
                        {filteredMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className="bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
                            onClick={() => handleEditMember(member.shift, member)}
                          >
                            <div className="font-medium text-gray-900">{member.memberName}</div>
                            <div className="text-gray-600">{getShiftLabel(member.shift)}</div>
                            {(member.slot || member.assignment) && (
                              <div className="text-gray-500">
                                {member.slot ? `Slot ${member.slot}` : ''}
                                {member.slot && member.assignment ? ' - ' : ''}
                                {member.assignment || ''}
                              </div>
                            )}
                          </div>
                        ))}
                        {filteredOnLeave.map((leave) => (
                          <div key={leave.id} className="bg-amber-50 p-2 rounded border border-amber-200">
                            <div className="font-medium text-gray-900">{leave.memberName}</div>
                            <div className="text-amber-700">On Leave: {leave.reason}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Monthly View
  const renderMonthlyView = () => {
    const monthDays = getMonthDays(currentDate);
    const firstDay = monthDays[0];
    const startDay = firstDay.getDay(); // 0 = Sunday

    // Create calendar grid
    const calendarDays = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }
    // Add month days
    monthDays.forEach(day => calendarDays.push(day));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {getMonthLabel(currentDate)}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(getPreviousMonth(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Previous Month
            </button>
            <button
              onClick={() => setCurrentDate(getTodayString())}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Current Month
            </button>
            <button
              onClick={() => setCurrentDate(getNextMonth(currentDate))}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next Month →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="border border-gray-200 rounded-md h-24 bg-gray-50"></div>;
            }

            const dateStr = formatDate(day);
            // Note: Monthly view shows only currently loaded day's warnings - acceptable for now
            const daySchedule = { shifts: { JPN: [], IST: [], CET_EARLY: [], CET_LATE: [], US_EARLY: [], US_LATE: [] }, onLeave: [] };
            const emptyShifts = getEmptyShiftsFromSchedule(daySchedule);
            const unassignedSlots = getUnassignedSlotsFromSchedule(daySchedule);
            const allMembers = [
              ...daySchedule.shifts.JPN.map(m => ({ ...m, shift: 'JPN' })),
              ...daySchedule.shifts.IST.map(m => ({ ...m, shift: 'IST' })),
              ...daySchedule.shifts.CET_EARLY.map(m => ({ ...m, shift: 'CET_EARLY' })),
              ...daySchedule.shifts.CET_LATE.map(m => ({ ...m, shift: 'CET_LATE' })),
              ...daySchedule.shifts.US_EARLY.map(m => ({ ...m, shift: 'US_EARLY' })),
              ...daySchedule.shifts.US_LATE.map(m => ({ ...m, shift: 'US_LATE' }))
            ];

            const filteredMembers = filterByMember(allMembers);
            const filteredOnLeave = filterOnLeaveByMember(daySchedule.onLeave);
            const hasOnLeave = filteredOnLeave.length > 0;

            return (
              <div
                key={dateStr}
                onClick={() => {
                  setCurrentDate(dateStr);
                  setView('daily');
                }}
                className={`border border-gray-200 rounded-md h-24 p-2 cursor-pointer hover:bg-gray-50 ${
                  isToday(day) ? 'bg-blue-50 border-blue-400' : ''
                } ${hasOnLeave ? 'bg-amber-50' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-sm text-gray-900">{day.getDate()}</div>
                  {(emptyShifts.length > 0 || unassignedSlots.length > 0) && (
                    <span 
                      className="text-red-600 font-bold" 
                      title={[
                        emptyShifts.length > 0 ? `Uncovered: ${emptyShifts.map(s => getShiftLabel(s)).join(', ')}` : '',
                        unassignedSlots.length > 0 ? `Unassigned Slots: ${unassignedSlots.join(', ')}` : ''
                      ].filter(Boolean).join(' | ')}
                    >
                      ⚠
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {filteredMembers.length > 0 && (
                    <>
                      {selectedMember ? (
                        // Show details when filtering by specific user
                        filteredMembers.map((member) => (
                          <div key={member.id} className="space-y-0.5">
                            <div className="text-gray-800 font-medium">{getShiftLabel(member.shift)}</div>
                            {member.slot && (
                              <div className="text-gray-700">Slot {member.slot}</div>
                            )}
                            {member.assignment && (
                              <div className="text-gray-700 font-medium">{member.assignment}</div>
                            )}
                          </div>
                        ))
                      ) : (
                        // Show count when viewing all users
                        <div>{filteredMembers.length} assigned</div>
                      )}
                    </>
                  )}
                  {filteredOnLeave.length > 0 && (
                    <div className="text-amber-700">{filteredOnLeave.length} on leave</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {view === 'daily' && renderDailyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'monthly' && renderMonthlyView()}

      {showAddModal && (
        <AddMemberModal
          dateStr={currentDate}
          shiftType={selectedShift}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showEditModal && editingMember && (
        <EditMemberModal
          dateStr={currentDate}
          shiftType={selectedShift}
          member={editingMember}
          onClose={() => {
            setShowEditModal(false);
            setEditingMember(null);
          }}
          onSuccess={handleRefresh}
        />
      )}

      {showPasteModal && schedule && (
        <CopyPasteScheduleModal
          copiedSchedule={schedule}
          sourceDate={currentDate}
          onClose={() => setShowPasteModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default ScheduleView;
