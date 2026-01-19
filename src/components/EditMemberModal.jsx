import React, { useState, useEffect } from 'react';
import { getAvailableSlots, getSlotLabel, getShiftLabel, getShiftTime } from '../utils/dateHelpers';
import { 
  updateShiftMember,
  deleteShiftMember,
  isSlotTaken, 
  isAssignmentTaken,
  getCustomAssignments,
  addCustomAssignment
} from '../firebase/firestore';

const EditMemberModal = ({ dateStr, shiftType, member, onClose, onSuccess }) => {
  const [selectedSlot, setSelectedSlot] = useState(member.slot ? member.slot.toString() : '');
  const [assignment, setAssignment] = useState('');
  const [customAssignment, setCustomAssignment] = useState('');
  const [customAssignments, setCustomAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const assignments = await getCustomAssignments();
      setCustomAssignments(assignments);
      
      // Set initial assignment value
      if (member.assignment) {
        const existingAssignments = await getCustomAssignments();
        if (existingAssignments.includes(member.assignment)) {
          setAssignment(member.assignment);
        } else {
          setAssignment('custom');
          setCustomAssignment(member.assignment);
        }
      }
    };
    loadData();
  }, [member.assignment]);

  const availableSlots = getAvailableSlots(shiftType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedSlot) {
      const slotNum = parseInt(selectedSlot);
      // Check if slot is taken by someone else
      if (slotNum !== member.slot && await isSlotTaken(dateStr, shiftType, slotNum)) {
        setError('This slot is already taken');
        return;
      }
    }

    const finalAssignment = assignment === 'custom' ? customAssignment : assignment;
    
    // Check if assignment is taken by someone else
    if (finalAssignment && finalAssignment !== member.assignment && await isAssignmentTaken(dateStr, finalAssignment)) {
      setError('This assignment is already taken for this day');
      return;
    }

    if (assignment === 'custom' && customAssignment) {
      await addCustomAssignment(customAssignment);
    }

    const updates = {
      memberId: member.memberId,
      memberName: member.memberName
    };
    
    if (selectedSlot) {
      updates.slot = parseInt(selectedSlot);
    } else {
      updates.slot = undefined;
    }
    
    if (finalAssignment) {
      updates.assignment = finalAssignment;
    } else {
      updates.assignment = undefined;
    }

    await updateShiftMember(dateStr, shiftType, member.id, updates);

    onSuccess();
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove ${member.memberName} from this shift?`)) {
      await deleteShiftMember(dateStr, shiftType, member.id);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Shift Assignment</h2>
          <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm font-medium text-gray-900">{getShiftLabel(shiftType)}</div>
            <div className="text-sm text-gray-600">{getShiftTime(shiftType)}</div>
          </div>
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="text-sm font-medium text-blue-900">{member.memberName}</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                const taken = slot !== member.slot && isSlotTaken(dateStr, shiftType, slot);
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
                const taken = assign !== member.assignment && isAssignmentTaken(dateStr, assign);
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

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <div className="flex space-x-3">
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
