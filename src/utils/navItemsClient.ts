import {
  LucideIcon,
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  ClipboardList,
  Calendar,
  Settings,
  Building,
  ListTodo,
  CalendarClock,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// ✅ Business/Client version — NOT used in current app, only for future variant
export const NAV_ITEMS_CLIENT: NavItem[] = [
  { path: '/dashboard/patients', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/doctor', label: "Business Owner's View", icon: Briefcase },
  { path: '/patients', label: 'Clients', icon: Users },
  { path: '/receptionist', label: 'Receptionist View', icon: User },
  { path: '/dashboard/profile', label: "Associate's View", icon: Building },
  { path: '/dashboard/documents', label: 'Upcoming Events', icon: ListTodo },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: CalendarClock },
  { path: '/settings/business', label: 'Settings', icon: Settings },
];
