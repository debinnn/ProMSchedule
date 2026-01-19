import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const Header = ({ view, setView, selectedMember, setSelectedMember, teamMembers }) => {
  const { user, logout, isAdmin } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const activeMembers = teamMembers.filter(m => m.active).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-semibold text-gray-900">
                Team Schedule Manager
              </Link>
              
              <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setView('daily')}
                  className={`px-4 py-1.5 text-sm font-medium rounded ${
                    view === 'daily'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded ${
                    view === 'weekly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setView('monthly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded ${
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
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Members</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/team"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Manage Team
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Manage Users
                    </Link>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      Logged in as <span className="font-medium">{user.username}</span>
                    </span>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;
