import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  BellDot,
  ClipboardList,
  NotebookText,
  Pill,
  FolderSearch,
  RotateCcw,
  NotebookPen,
  CheckSquare,
  CalendarClock,
  User,
  UserCog,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isVisible: boolean;
  onHideSidebar: () => void;
}

const navItems = [
  { label: 'Patients', path: '/patients', icon: Users },
  { label: 'Critical Alerts', path: '/alerts', icon: BellDot },
  { label: 'Upcoming Cases/Slates', path: '/slates', icon: ClipboardList },
  { label: 'Consultations', path: '/consultations', icon: NotebookText },
  { label: 'Prescriptions', path: '/prescriptions', icon: Pill },
  { label: 'Diagnostics & Results', path: '/diagnostics', icon: FolderSearch },
  { label: 'Referrals', path: '/referrals', icon: RotateCcw },
  { label: 'Notes', path: '/notes', icon: NotebookPen },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Appointments', path: '/appointments', icon: CalendarClock },
  { label: 'Receptionist View', path: '/receptionist', icon: User },
  { label: 'Staff/Roles Management', path: '/roles/list', icon: UserCog },
  { label: 'System Settings', path: '/settings/business', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onHideSidebar }) => {
  const location = useLocation();

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-50 transition-all duration-300 ${
        isVisible ? 'w-64' : 'w-16'
      } overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}
    >
      <div className="flex flex-col items-start px-4 pt-6">
        {navItems.map((item) => {
          const Icon = item.icon; // Assign to a capitalized variable for React component recognition
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onHideSidebar}
              className={({ isActive }) =>
                `flex items-center w-full gap-3 py-2 px-2 rounded-md text-sm transition ${
                  isActive
                    ? 'bg-[#f5f5f5] text-[#5c3a21] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className="shrink-0" />
                <span className={`truncate ${!isVisible ? 'hidden' : ''}`}>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
