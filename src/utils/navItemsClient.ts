import {
  Users,
  User,
  ClipboardList,
  CalendarClock,
  Settings,
  Building,
  BellRing,
  Stethoscope,
  FileText,
  FileCheck,
  FileBarChart,
  Repeat,
  PencilLine,
  UserCog,
  MessageCircle,
  LayoutDashboard,
  SearchCheck
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: typeof BellRing;
}

export const NAV_ITEMS_CLIENT: NavItem[] = [
  { path: '/doctor',              label: "Business Owner's View",     icon: Stethoscope     },
  { path: '/patients',            label: 'Clients',                   icon: Users           },
  { path: '/alerts',              label: 'Critical Alerts',           icon: BellRing        },
  { path: '/slates',              label: 'Upcoming Cases/Slates',     icon: CalendarClock   },
  { path: '/consultations',       label: 'Consultations',             icon: MessageCircle   },
  { path: '/prescriptions',       label: 'Prescriptions',             icon: FileCheck       },
  { path: '/blood-results',       label: 'Blood Results',             icon: FileBarChart    },
  { path: '/imaging',             label: 'Imaging Results',           icon: FileText        },
  { path: '/investigations',      label: 'Other Investigations',      icon: SearchCheck     },
  { path: '/referrals',           label: 'Referrals',                 icon: Repeat          },
  { path: '/notes',               label: 'Notes',                     icon: PencilLine      },
  { path: '/tasks',               label: 'Tasks',                     icon: ClipboardList   },
  { path: '/appointments',        label: 'Appointments',              icon: CalendarClock   },
  { path: '/receptionist',        label: 'Receptionist View',         icon: User            },
  { path: '/dashboard/profile',   label: "Associate's View",          icon: Building        },
  { path: '/roles',               label: 'Staff/Role Management',     icon: UserCog         },
  { path: '/settings/business',   label: 'System Settings',           icon: Settings        },
  { path: '/dashboard/patients',  label: 'Business Hub',              icon: LayoutDashboard },
];
