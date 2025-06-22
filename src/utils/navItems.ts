import {
  LucideIcon,
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  ClipboardList,
  CalendarClock,
  Settings,
  Building2,
  MonitorDot,
  Stethoscope,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// ✅ MAIN APP NAVIGATION
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/doctor', label: "Doctor's View", icon: Stethoscope },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/receptionist', label: 'Receptionist View', icon: User },
  { path: '/dashboard/profile', label: "Hospital's Dashboard", icon: Building2 },
  { path: '/slates', label: 'Upcoming Cases/Slates', icon: MonitorDot }, // ✅ FIXED PATH
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: CalendarClock },
  { path: '/settings/business', label: 'Settings', icon: Settings },
];
