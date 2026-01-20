import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import ExportModal from './ExportModal';

const Header = ({ view, setView, selectedMember, setSelectedMember, teamMembers }) => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const activeMembers = teamMembers.filter(m => m.active).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-3 gap-3">
            {/* Left side: Title, View Buttons, Member Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Link to="/" className="text-lg sm:text-xl font-semibold text-gray-900">
                Team Schedule Manager
              </Link>
              
              <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setView('daily')}
                  className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded ${
                    view === 'daily'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded ${
                    view === 'weekly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setView('monthly')}
                  className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded ${
                    view === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
              </div>

              <select
                value={selectedMember || ''}
                onChange={(e) => setSelectedMember(e.target.value || null)}
                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="">All Members</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Right side: Export Button + User Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-green-600 border border-green-600 rounded-md hover:bg-green-50 flex items-center w-full sm:w-auto justify-center sm:justify-start"
                title="Export schedule to Excel"
              >
                📥 Export
              </button>
              {user ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Link
                    to="/team"
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                  >
                    Manage Team
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                    >
                      Manage Users
                    </Link>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">{user.username}</span>
                    </span>
                    <button
                      onClick={logout}
                      className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 w-full sm:w-auto"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
    </>
  );
};

export default Header;
