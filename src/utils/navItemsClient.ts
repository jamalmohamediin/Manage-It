// src/utils/navItems_client.ts
import {
  LucideIcon,
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  ClipboardList,
  CalendarClock,
  Settings,
  Building,
  ListTodo,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// Business/Client version, relabeled with “Business Hub”
export const NAV_ITEMS_CLIENT: NavItem[] = [
  { path: '/doctor',                label: "Business Owner's View",   icon: Briefcase      },
  { path: '/patients',              label: 'Clients',                 icon: Users          },
  { path: '/receptionist',          label: 'Receptionist View',      icon: User           },
  { path: '/dashboard/profile',     label: "Associate's View",        icon: Building       },
  { path: '/slates',                label: 'Upcoming Events',         icon: ListTodo       },
  { path: '/tasks',                 label: 'Tasks',                   icon: ClipboardList },
  { path: '/appointments',          label: 'Appointments',            icon: CalendarClock },
  { path: '/dashboard/patients',    label: 'Business Hub',            icon: LayoutDashboard },
  { path: '/settings/business',     label: 'Settings',                icon: Settings       },
];
