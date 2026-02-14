import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Complaints from './pages/Complaints';
import MapView from './pages/MapView';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;