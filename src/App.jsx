import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initializeData, getAllTeamMembers } from './firebase/firestore';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import AdminPanel from './components/AdminPanel';
import TeamManagement from './components/TeamManagement';

function App() {
  const [view, setView] = useState('daily');
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    // Initialize data on first load
    const init = async () => {
      await initializeData();
      loadTeamMembers();
    };
    init();
  }, []);

  const loadTeamMembers = async () => {
    const members = await getAllTeamMembers();
    setTeamMembers(members);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header
                    view={view}
                    setView={setView}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    teamMembers={teamMembers}
                  />
                  <ScheduleView
                    view={view}
                    setView={setView}
                    selectedMember={selectedMember}
                    teamMembers={teamMembers}
                  />
                </>
              }
            />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/team" element={<TeamManagement />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
