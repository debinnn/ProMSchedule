import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getShiftLabel, getShiftTime, getSlotLabel } from '../utils/dateHelpers';
import { deleteShiftMember } from '../firebase/firestore';

const ShiftCard = ({ shiftType, members, dateStr, onAddMember, onUpdate, onEditMember }) => {
  const { isEditor } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDelete = (entryId) => {
    if (window.confirm('Are you sure you want to remove this member from the shift?')) {
      deleteShiftMember(dateStr, shiftType, entryId);
      onUpdate();
      showMessage('Member removed successfully');
    }
  };

  const getShiftColor = () => {
    switch (shiftType) {
      case 'JPN':
        return 'bg-slate-50 border-l-4 border-slate-400';
      case 'IST':
        return 'bg-blue-50 border-l-4 border-blue-400';
      case 'CET_EARLY':
        return 'bg-purple-50 border-l-4 border-purple-400';
      case 'CET_LATE':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  return (
    <div className={`rounded-lg p-6 ${getShiftColor()}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getShiftLabel(shiftType)}
          </h3>
          <p className="text-sm text-gray-600">{getShiftTime(shiftType)}</p>
        </div>
        {isEditor() && (
          <button
            onClick={onAddMember}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            + Add Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No members assigned</p>
      ) : (
        <div className="space-y-2">
          {members.sort((a, b) => a.memberName.localeCompare(b.memberName)).map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center bg-white rounded-md px-4 py-3 border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">{member.memberName}</span>
                {member.slot && (
                  <span className="text-sm text-gray-600">
                    {getSlotLabel(member.slot)}
                  </span>
                )}
                {member.assignment && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                    {member.assignment}
                  </span>
                )}
              </div>
              {isEditor() && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditMember(member)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ShiftCard;
