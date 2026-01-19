import React, { useState, useEffect } from 'react';
import { getAvailableSlots, getSlotLabel, getShiftLabel, getShiftTime } from '../utils/dateHelpers';
import { 
  getActiveTeamMembers, 
  addShiftMember, 
  isSlotTaken, 
  isAssignmentTaken,
  getAssignedMemberIds,
  getCustomAssignments,
  addCustomAssignment
} from '../firebase/firestore';

const AddMemberModal = ({ dateStr, shiftType, onClose, onSuccess }) => {
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [assignment, setAssignment] = useState('');
  const [customAssignment, setCustomAssignment] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [customAssignments, setCustomAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const allMembers = getActiveTeamMembers();
    const assignedIds = getAssignedMemberIds(dateStr);
    const available = allMembers.filter(m => !assignedIds.includes(m.id));
    setAvailableMembers(available);
    setCustomAssignments(getCustomAssignments());
  }, [dateStr]);

  const availableSlots = getAvailableSlots(shiftType);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedMember) {
      setError('Please select a member');
      return;
    }

    if (selectedSlot) {
      const slotNum = parseInt(selectedSlot);
      if (isSlotTaken(dateStr, shiftType, slotNum)) {
        setError('This slot is already taken');
        return;
      }
    }

    const finalAssignment = assignment === 'custom' ? customAssignment : assignment;
    
    if (finalAssignment && isAssignmentTaken(dateStr, finalAssignment)) {
      setError('This assignment is already taken for this day');
      return;
    }

    const member = availableMembers.find(m => m.id === parseInt(selectedMember));

    if (assignment === 'custom' && customAssignment) {
      addCustomAssignment(customAssignment);
    }

    const memberData = {
      memberId: member.id,
      memberName: member.name
    };
    
    if (selectedSlot) {
      memberData.slot = parseInt(selectedSlot);
    }
    
    if (finalAssignment) {
      memberData.assignment = finalAssignment;
    }
    
    addShiftMember(dateStr, shiftType, memberData);

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Add Member to Shift</h2>
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{getShiftLabel(shiftType)}</div>
            <div className="text-sm text-gray-600">{getShiftTime(shiftType)}</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {availableMembers.sort((a, b) => a.name.localeCompare(b.name)).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Slot <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No specific slot</option>
              {availableSlots.map((slot) => {
                const taken = isSlotTaken(dateStr, shiftType, slot);
                return (
                  <option key={slot} value={slot} disabled={taken}>
                    {getSlotLabel(slot)} {taken ? '(Taken)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <select
              value={assignment}
              onChange={(e) => {
                setAssignment(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomAssignment('');
                }
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No assignment</option>
              {customAssignments.map((assign) => {
                const taken = isAssignmentTaken(dateStr, assign);
                return (
                  <option key={assign} value={assign} disabled={taken}>
                    {assign} {taken ? '(Taken)' : ''}
                  </option>
                );
              })}
              <option value="custom">Custom...</option>
            </select>
          </div>

          {assignment === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Assignment
              </label>
              <input
                type="text"
                value={customAssignment}
                onChange={(e) => setCustomAssignment(e.target.value)}
                placeholder="Enter custom assignment"
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
              onClick={onClose}
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
  );
};

export default AddMemberModal;
