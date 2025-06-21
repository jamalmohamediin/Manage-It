import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import AppointmentCalendar from './components/AppointmentCalendar';
import RoleForm from './components/RoleForm';
import RoleList from './components/RoleList';
import BusinessSelector from './components/BusinessSelector';
import NotificationBell from './components/NotificationBell';
import UserSwitcher from './components/UserSwitcher';
import { BusinessProvider } from './contexts/BusinessContext';
import { UserProvider } from './contexts/UserContext';
import { RoleProvider } from './contexts/RoleContext';
import { LanguageProvider } from './contexts/LanguageContext';
import PatientDashboard from './components/PatientDashboard';
import MainDashboard from './components/MainDashboard';
import BusinessSettings from './components/BusinessSettings';
import PublicLanding from './pages/PublicLanding';
import Documents from './components/Documents';
import BusinessProfile from './pages/BusinessProfile';
import ClientView from './pages/ClientView';
import Sidebar from './components/Sidebar'; // Correct import for Sidebar

const App: React.FC = () => {
  return (
    <UserProvider>
      <BusinessProvider>
        <RoleProvider>
          <LanguageProvider>
            <Router>
              <div className="relative min-h-screen pb-16 md:pb-0 p-4 space-y-6 bg-[#fffaf5] flex">
                {/* Sidebar - left vertical navigation */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 ml-64"> {/* Adjusting content to the right after sidebar */}
                  {/* Header */}
                  <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <h1 className="text-3xl font-bold text-[#3b2615]">Manage It</h1>
                      <UserSwitcher />
                    </div>
                    <NotificationBell />
                  </header>

                  {/* Business Selector */}
                  <div className="max-w-md mx-auto mb-4">
                    <BusinessSelector />
                  </div>

                  {/* Routes */}
                  <Routes>
                    <Route path="/" element={<MainDashboard />} />
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
                  </Routes>
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
