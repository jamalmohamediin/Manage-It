// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import PatientDashboard from './components/PatientDashboard';
import { Calendar, Users, User, ClipboardList, LayoutDashboard } from "lucide-react";
import MainDashboard from './components/MainDashboard';

const NAV_ITEMS = [
  {
    path: "/patients",
    label: "Patients",
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: "/tasks",
    label: "Tasks",
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    path: "/appointments",
    label: "Appointments",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    path: "/dashboard/patients",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: "/roles",
    label: "Roles",
    icon: <User className="w-5 h-5" />,
  },
];

function MainNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper: Match the nav path to current URL (supports subroutes)
  const isActive = (path: string) => {
    if (path === "/patients" && (location.pathname === "/" || location.pathname === "/patients")) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Tabs */}
      <nav className="justify-center hidden gap-6 mb-2 md:flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition ${
              isActive(item.path)
                ? "bg-[#eedccb] text-[#5c3a21] shadow"
                : "text-[#3b2615] hover:bg-[#f8f1e8]"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#fff6ec] border-t border-[#e9d8c3] flex justify-around items-center py-2 shadow-lg">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-2 py-1 transition ${
              isActive(item.path)
                ? "text-[#8d6434]"
                : "text-[#b9a384] hover:text-[#5c3a21]"
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

const App: React.FC = () => {
  return (
    <UserProvider>
      <BusinessProvider>
        <RoleProvider>
          <Router>
            <div className="relative min-h-screen pb-16 md:pb-0 p-4 space-y-6 bg-[#fffaf5]">
              {/* Header */}
              <header className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-[#3b2615]">Manage It</h1>
                  <UserSwitcher />
                </div>
                <NotificationBell />
              </header>

              {/* Main Nav */}
              <MainNav />

              {/* Business Selector at the top */}
              <div className="max-w-md mx-auto mb-4">
                <BusinessSelector />
              </div>

              {/* App Routes */}
              <Routes>
                <Route path="/" element={<MainDashboard />} /> {/* HOME DASHBOARD */}
                <Route path="/patients" element={<PatientList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/appointments/new" element={<AppointmentForm />} />
                <Route path="/appointments" element={<AppointmentList />} />
                <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
                <Route path="/dashboard/patients" element={<PatientDashboard />} />
                <Route path="/roles" element={<RoleForm />} />
                <Route path="/roles/list" element={<RoleList />} />
              </Routes>
            </div>
          </Router>
        </RoleProvider>
      </BusinessProvider>
    </UserProvider>
  );
};

export default App;
