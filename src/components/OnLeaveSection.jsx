import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getActiveTeamMembers, 
  addOnLeave, 
  deleteOnLeave, 
  getAssignedMemberIds,
  getCustomLeaveReasons,
  addCustomLeaveReason
} from '../firebase/firestore';
import { eachDayOfInterval, parseISO, format } from 'date-fns';

const OnLeaveSection = ({ dateStr, onLeave, onUpdate }) => {
  const { isEditor } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [startDate, setStartDate] = useState(dateStr);
  const [endDate, setEndDate] = useState(dateStr);
  const [isBulk, setIsBulk] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [leaveReasons, setLeaveReasons] = useState([]);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (showModal) {
      const loadData = async () => {
        const allMembers = await getActiveTeamMembers();
        const assignedIds = await getAssignedMemberIds(dateStr);
        const available = allMembers.filter(m => !assignedIds.includes(m.id));
        setAvailableMembers(available);
        const reasons = await getCustomLeaveReasons();
        setLeaveReasons(reasons);
      };
      loadData();
      setStartDate(dateStr);
      setEndDate(dateStr);
      setIsBulk(false);
    }
  }, [showModal, dateStr]);

  const showMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMember || (!reason && !customReason)) {
      setError('Please fill in all fields');
      return;
    }

    if (isBulk && new Date(startDate) > new Date(endDate)) {
      setError('End date must be after or equal to start date');
      return;
    }

    const member = availableMembers.find(m => m.id === parseInt(selectedMember));
    const finalReason = reason === 'custom' ? customReason : reason;

    if (reason === 'custom' && customReason) {
      await addCustomLeaveReason(customReason);
    }

    const leaveEntry = {
      memberId: member.id,
      memberName: member.name,
      reason: finalReason
    };

    if (isBulk) {
      // Apply leave for date range
      const dates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
      
      for (const date of dates) {
        const dateString = format(date, 'yyyy-MM-dd');
        await addOnLeave(dateString, leaveEntry);
      }
      
      showMessage(`Leave applied for ${dates.length} day${dates.length > 1 ? 's' : ''}`);
    } else {
      // Single day
      await addOnLeave(dateStr, leaveEntry);
      showMessage('Member added to leave list');
    }

    onUpdate();
    setShowModal(false);
    setSelectedMember('');
    setReason('');
    setCustomReason('');
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to remove this member from leave?')) {
      await deleteOnLeave(dateStr, entryId);
      onUpdate();
      showMessage('Member removed from leave list');
    }
  };

  return (
    <>
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">On Leave</h3>
          {isEditor() && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-amber-600 border border-amber-600 rounded-md hover:bg-amber-50 w-full sm:w-auto"
            >
              + Add Member to Leave
            </button>
          )}
        </div>

        {onLeave.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No members on leave</p>
        ) : (
          <div className="space-y-2">
            {onLeave.map((leave) => (
              <div
                key={leave.id}
                className="flex justify-between items-center bg-white rounded-md px-4 py-3 border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">{leave.memberName}</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                    {leave.reason}
                  </span>
                </div>
                {isEditor() && (
                  <button
                    onClick={() => handleDelete(leave.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add Member to Leave</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                  <input
                    type="checkbox"
                    checked={isBulk}
                    onChange={(e) => setIsBulk(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Apply leave for multiple days</span>
                </label>
              </div>

              {isBulk && (
                <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-200">
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
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a member...</option>
                  {availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomReason('');
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose reason...</option>
                  {leaveReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
              </div>

              {reason === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Reason
                  </label>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom reason"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMember('');
                    setReason('');
                    setCustomReason('');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default OnLeaveSection;
