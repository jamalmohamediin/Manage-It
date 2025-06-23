// src/utils/navItems.ts
import {
  LucideIcon,
  LayoutDashboard,
  Stethoscope,
  Users,
  User,
  Building2,
  MonitorDot,
  ClipboardList,
  CalendarClock,
  Settings,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// Main application navigation, reordered and relabeled
export const NAV_ITEMS: NavItem[] = [
  { path: '/doctor',                label: "Doctor's View",          icon: Stethoscope    },
  { path: '/patients',              label: 'Patients',                icon: Users          },
  { path: '/receptionist',          label: 'Receptionist View',      icon: User           },
  { path: '/dashboard/profile',     label: "Hospital's Dashboard",    icon: Building2      },
  { path: '/slates',                label: 'Upcoming Cases/Slates',   icon: MonitorDot     },
  { path: '/tasks',                 label: 'Tasks',                   icon: ClipboardList },
  { path: '/appointments',          label: 'Appointments',            icon: CalendarClock },
  { path: '/dashboard',             label: 'Business Hub',            icon: LayoutDashboard },
  { path: '/settings/business',     label: 'Settings',                icon: Settings       },
];

// (Optional) Client/Business-owner variant
export const NAV_ITEMS_CLIENT: NavItem[] = [
  { path: '/doctor',                label: "Business Owner's View",   icon: Stethoscope    },
  { path: '/patients',              label: 'Clients',                 icon: Users          },
  { path: '/receptionist',          label: 'Receptionist View',      icon: User           },
  { path: '/dashboard/profile',     label: "Associate's View",        icon: Building2      },
  { path: '/slates',                label: 'Upcoming Events',         icon: MonitorDot     },
  { path: '/tasks',                 label: 'Tasks',                   icon: ClipboardList },
  { path: '/appointments',          label: 'Appointments',            icon: CalendarClock },
  { path: '/dashboard/patients',    label: 'Business Hub',            icon: LayoutDashboard },
  { path: '/settings/business',     label: 'Settings',                icon: Settings       },
];
