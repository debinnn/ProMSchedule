import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTeamMembers, createTeamMember, updateTeamMember, toggleMemberStatus } from '../utils/localStorage';

const TeamManagement = () => {
  const { isEditor } = useAuth();
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!isEditor()) {
      window.location.href = '/';
      return;
    }
    loadMembers();
  }, []);

  const loadMembers = () => {
    setMembers(getAllTeamMembers());
  };

  const showMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    try {
      createTeamMember(name);
      loadMembers();
      setShowAddModal(false);
      setName('');
      showMessage('Team member added successfully');
    } catch (err) {
      setError('Failed to add team member');
    }
  };

  const handleEditMember = (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    try {
      updateTeamMember(selectedMember.id, { name });
      loadMembers();
      setShowEditModal(false);
      setSelectedMember(null);
      setName('');
      showMessage('Team member updated successfully');
    } catch (err) {
      setError('Failed to update team member');
    }
  };

  const handleToggleStatus = (memberId) => {
    const member = members.find(m => m.id === memberId);
    const action = member.active ? 'deactivate' : 'activate';
    
    if (window.confirm(`Are you sure you want to ${action} this team member?`)) {
      toggleMemberStatus(memberId);
      loadMembers();
      showMessage(`Team member ${action}d successfully`);
    }
  };

  if (!isEditor()) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Schedule
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + Add New Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{member.name}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    member.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <button
                    onClick={() => {
                      setSelectedMember(member);
                      setName(member.name);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    className={member.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {member.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Team Member</h2>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 2 characters</p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setName('');
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Team Member</h2>
            
            <form onSubmit={handleEditMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 2 characters</p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMember(null);
                    setName('');
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
    </div>
  );
};

export default TeamManagement;
