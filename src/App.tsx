// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import BusinessSelector from './components/BusinessSelector';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import AppointmentCalendar from './components/AppointmentCalendar';
import RoleForm from './components/RoleForm';
import RoleList from './components/RoleList';
import Documents from './components/Documents';
import PatientDashboard from './components/PatientDashboard';
import MainDashboard from './components/MainDashboard';
import BusinessSettings from './components/BusinessSettings';
import BusinessProfile from './pages/BusinessProfile';
import PublicLanding from './pages/PublicLanding';
import ClientView from './pages/ClientView';
import NotificationList from './components/NotificationList';
import DoctorView from './pages/DoctorView'; // ✅ NEW IMPORT

import { BusinessProvider } from './contexts/BusinessContext';
import { UserProvider } from './contexts/UserContext';
import { RoleProvider } from './contexts/RoleContext';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  return (
    <UserProvider>
      <BusinessProvider>
        <RoleProvider>
          <LanguageProvider>
            <Router>
              <div className="relative min-h-screen bg-[#fffaf5] flex">
                <Sidebar
                  isVisible={isSidebarVisible}
                  onHideSidebar={() => setSidebarVisible(false)}
                />
                <div
                  className={`transition-all duration-300 flex-1 ${
                    isSidebarVisible ? 'ml-64' : 'ml-16'
                  }`}
                >
                  <HeaderBar onToggleSidebar={toggleSidebar} />
                  <div className="px-4 pb-10 mt-4 space-y-6 md:px-6">
                    <BusinessSelector />

                    <Routes>
                      <Route path="/" element={<MainDashboard />} />
                      <Route path="/doctor" element={<DoctorView />} /> {/* ✅ NEW ROUTE */}
                      <Route path="/patients" element={<PatientList />} />
                      <Route path="/tasks/new" element={<TaskForm />} />
                      <Route path="/tasks" element={<TaskList />} />
                      <Route path="/appointments/new" element={<AppointmentForm />} />
                      <Route path="/appointments" element={<AppointmentList />} />
                      <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
                      <Route path="/dashboard/patients" element={<PatientDashboard />} />
                      <Route path="/dashboard/documents" element={<Documents />} />
                      <Route path="/dashboard/profile" element={<BusinessProfile />} />
                      <Route path="/roles" element={<RoleForm />} />
                      <Route path="/roles/list" element={<RoleList />} />
                      <Route path="/settings/business" element={<BusinessSettings />} />
                      <Route path="/industries" element={<PublicLanding />} />
                      <Route path="/client" element={<ClientView />} />
                      <Route
                        path="/notifications"
                        element={
                          <NotificationList notifications={[]} userId="" onUpdate={() => {}} />
                        }
                      />
                    </Routes>
                  </div>
                </div>
              </div>
            </Router>
          </LanguageProvider>
        </RoleProvider>
      </BusinessProvider>
    </UserProvider>
  );
};

export default App;
