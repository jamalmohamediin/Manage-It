import { LucideIcon } from 'lucide-react';
import { Calendar, Users, User, ClipboardList, LayoutDashboard, Settings, Building2 } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// Export NAV_ITEMS array with icon component references (not JSX)
export const NAV_ITEMS: NavItem[] = [
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/dashboard/patients', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/documents', label: 'Documents', icon: ClipboardList },
  { path: '/dashboard/profile', label: 'Profile', icon: Building2 },
  { path: '/roles', label: 'Roles', icon: User },
  { path: '/settings/business', label: 'Settings', icon: Settings },
];