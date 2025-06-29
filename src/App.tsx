import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import HorizontalNavBar from './components/HorizontalNavBar';

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
import HospitalDashboard from './pages/HospitalDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ReceptionistView from './pages/ReceptionistView';
import AssociateView from './pages/AssociateView';
import Consultations from './pages/Consultations';
import Prescriptions from './pages/Prescriptions';
import BloodResults from './pages/BloodResults';
import ImagingResults from './pages/ImagingResults';
import Diagnostics from './pages/Diagnostics';
import Referrals from './pages/Referrals';
import Notes from './pages/Notes';
import Patients from './pages/Patients';
import CriticalAlerts from './pages/CriticalAlerts';
import UpcomingSlates from './pages/UpcomingSlates';

import { BusinessProvider } from './contexts/BusinessContext';
import { UserProvider } from './contexts/UserContext';
import { RoleProvider } from './contexts/RoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { SelectedPatientProvider } from './contexts/SelectedPatientContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  return (
    <DashboardProvider>
      <UserProvider>
        <BusinessProvider>
          <RoleProvider>
            <LanguageProvider>
              <SelectedPatientProvider>
                <Router>
                  <div className="relative flex min-h-screen bg-gray-50">
                    <Sidebar isVisible={isSidebarVisible} onHideSidebar={() => setSidebarVisible(false)} />
                    <div className={`transition-all duration-300 flex-1 ${isSidebarVisible ? 'ml-64' : 'ml-16'}`}>
                      <HeaderBar onToggleSidebar={toggleSidebar} />
                      <div className="px-4 pb-10 mt-4 space-y-6 md:px-6">
                        <HorizontalNavBar />
                        <Routes>
                          <Route path="/" element={<Navigate to="/patients" replace />} />
                          <Route path="/dashboard" element={<MainDashboard />} />
                          <Route path="/hospital" element={<HospitalDashboard />} />
                          <Route path="/patients" element={<Patients />} />
                          <Route path="/alerts" element={<CriticalAlerts />} />
                          <Route path="/slates" element={<UpcomingSlates />} />
                          <Route path="/consultations" element={<Consultations />} />
                          <Route path="/prescriptions" element={<Prescriptions />} />
                          <Route path="/blood-results" element={<BloodResults />} />
                          <Route path="/imaging" element={<ImagingResults />} />
                          <Route path="/diagnostics" element={<Diagnostics />} />
                          <Route path="/referrals" element={<Referrals />} />
                          <Route path="/notes" element={<Notes />} />
                          <Route path="/receptionist" element={<ReceptionistView />} />
                          <Route path="/associate" element={<AssociateView />} />
                          <Route path="/client-dashboard" element={<ClientDashboard />} />

                          {/* Forms & Lists */}
                          <Route path="/tasks/new" element={<TaskForm />} />
                          <Route path="/tasks" element={<TaskList />} />
                          <Route path="/appointments/new" element={<AppointmentForm />} />
                          <Route path="/appointments" element={<AppointmentList />} />
                          <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
                          <Route path="/roles" element={<RoleForm />} />
                          <Route path="/roles/list" element={<RoleList />} />

                          {/* Internal Tools */}
                          <Route path="/dashboard/patients" element={<PatientDashboard />} />
                          <Route path="/dashboard/documents" element={<Documents />} />
                          <Route path="/dashboard/profile" element={<BusinessProfile />} />
                          <Route path="/settings/business" element={<BusinessSettings />} />

                          {/* Public & Client Routes */}
                          <Route path="/industries" element={<PublicLanding />} />
                          <Route path="/client" element={<ClientView />} />
                        </Routes>
                      </div>
                    </div>
                  </div>
                  <ToastContainer position="top-right" autoClose={3000} />
                </Router>
              </SelectedPatientProvider>
            </LanguageProvider>
          </RoleProvider>
        </BusinessProvider>
      </UserProvider>
    </DashboardProvider>
  );
};

export default App;
