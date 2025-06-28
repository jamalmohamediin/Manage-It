import { NavLink } from 'react-router-dom';
import {
  Users, AlertTriangle, CalendarClock, MessageSquareHeart,
  Pill, Droplets, ImageIcon, Microscope,
  RefreshCw, StickyNote
} from 'lucide-react';

const tabs = [
  { to: '/patients', icon: <Users className="w-4 h-4" />, label: 'Patients' },
  { to: '/alerts', icon: <AlertTriangle className="w-4 h-4" />, label: 'Critical Alerts' },
  { to: '/slates', icon: <CalendarClock className="w-4 h-4" />, label: 'Upcoming Cases/Slates' },
  { to: '/consultations', icon: <MessageSquareHeart className="w-4 h-4" />, label: 'Consultations' },
  { to: '/prescriptions', icon: <Pill className="w-4 h-4" />, label: 'Prescriptions' },
  { to: '/blood-results', icon: <Droplets className="w-4 h-4" />, label: 'Blood Results' },
  { to: '/imaging', icon: <ImageIcon className="w-4 h-4" />, label: 'Imaging Results' },
  { to: '/investigations', icon: <Microscope className="w-4 h-4" />, label: 'Other Investigations' },
  { to: '/referrals', icon: <RefreshCw className="w-4 h-4" />, label: 'Referrals' },
  { to: '/notes', icon: <StickyNote className="w-4 h-4" />, label: 'Notes' },
];

const DoctorTabBar = () => {
  return (
    <div className="flex flex-wrap items-center justify-start w-full px-4 py-3 mb-6 space-x-4 overflow-x-auto text-sm bg-white shadow-inner rounded-xl">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2 rounded-full transition ${
              isActive
                ? 'bg-yellow-100 text-yellow-800 font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`
          }
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};

export default DoctorTabBar;