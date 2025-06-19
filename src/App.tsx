// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AppointmentForm from './components/AppointmentForm';
import RoleForm from './components/RoleForm';
import RoleList from './components/RoleList';
import BusinessSelector from './components/BusinessSelector';
import NotificationBell from './components/NotificationBell';
import UserSwitcher from './components/UserSwitcher';
import { BusinessProvider } from './contexts/BusinessContext';
import { UserProvider } from './contexts/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <BusinessProvider>
        <Router>
          <div className="relative p-4 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-[#3b2615]">Manage It</h1>
                <UserSwitcher />
              </div>
              <NotificationBell />
            </header>

            {/* Business Selector at the top */}
            <div className="max-w-md mx-auto">
              <BusinessSelector />
            </div>

            {/* App Routes */}
            <Routes>
              <Route path="/" element={<PatientForm />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/appointments" element={<AppointmentForm />} />
              <Route path="/roles" element={<RoleForm />} />
              <Route path="/roles/list" element={<RoleList />} />
            </Routes>
          </div>
        </Router>
      </BusinessProvider>
    </UserProvider>
  );
};

export default App;
