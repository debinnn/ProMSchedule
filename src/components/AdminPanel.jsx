import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, createUser, deleteUser, resetUserPassword } from '../utils/localStorage';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/';
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  const showMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const validateUsername = (uname) => {
    if (uname.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9]+$/.test(uname)) {
      return 'Username must be alphanumeric only';
    }
    return null;
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setError('');

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      createUser(username, password);
      loadUsers();
      setShowAddModal(false);
      setUsername('');
      setPassword('');
      showMessage('User created successfully');
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      loadUsers();
      showMessage('User deleted successfully');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    resetUserPassword(selectedUser.id, newPassword);
    setShowResetModal(false);
    setSelectedUser(null);
    setNewPassword('');
    showMessage('Password reset successfully');
  };

  if (!isAdmin()) {
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
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + Add New Editor
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowResetModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Add New Editor</h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Min 3 characters, alphanumeric only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, must have uppercase, lowercase, and number
                </p>
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
                    setUsername('');
                    setPassword('');
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Reset Password for {selectedUser.username}
            </h2>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, must have uppercase, lowercase, and number
                </p>
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
                    setShowResetModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
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
                  Reset Password
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

export default AdminPanel;
