import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';

const mainTabs = [
  { label: 'Patients', path: '/patients', icon: Users },
  { label: 'Critical Alerts', path: '/alerts', icon: BellDot },
  { label: 'Upcoming Cases/Slates', path: '/slates', icon: ClipboardList },
  { label: 'Consultations', path: '/consultations', icon: NotebookText },
  { label: 'Prescriptions', path: '/prescriptions', icon: Pill }, // 💊 Capsule icon
  { label: 'Diagnostics & Results', path: '/diagnostics', icon: FolderSearch },
];

const actionTabs = [
  { label: 'Referrals', path: '/referrals', icon: RotateCcw },
  { label: 'Notes', path: '/notes', icon: NotebookPen },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Appointments', path: '/appointments', icon: CalendarClock },
  { label: 'Receptionist View', path: '/receptionist', icon: User },
  { label: 'Staff/Roles Management', path: '/roles/list', icon: UserCog },
  { label: 'System Setting', path: '/settings/business', icon: Settings },
];

const HorizontalNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="relative flex flex-wrap items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
      {mainTabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border transition ${
            location.pathname === tab.path
              ? 'bg-[#f5f5f5] border-[#5c3a21] text-[#5c3a21]'
              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1 text-gray-600 bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200"
        >
          <ClipboardList size={16} />
          Actions & Planning
          <ChevronDown size={16} />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-64 p-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-md">
            {actionTabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => {
                  navigate(tab.path);
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HorizontalNavBar;
