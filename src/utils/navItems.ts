import {
  Stethoscope,
  Users,
  AlertTriangle,
  MessageSquareText,
  Pill,
  FlaskConical,
  SearchCheck,
  Repeat,
  StickyNote,
  ClipboardList,
  CalendarClock,
  User,
  Building2,
  Settings,
  ShieldCheck
} from 'lucide-react';

import { ComponentType } from 'react';

export interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/doctor', label: "Doctor's View", icon: Stethoscope },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/alerts', label: 'Critical Alerts', icon: AlertTriangle },
  { path: '/consultations', label: 'Consultations', icon: MessageSquareText },
  { path: '/prescriptions', label: 'Prescriptions', icon: Pill },
  { path: '/imaging', label: 'Imaging Results', icon: FlaskConical },
  { path: '/investigations', label: 'Investigations', icon: SearchCheck },
  { path: '/referrals', label: 'Referrals', icon: Repeat },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: CalendarClock },
  { path: '/receptionist', label: 'Receptionist View', icon: User },
  { path: '/dashboard/profile', label: "Hospital's View", icon: Building2 },
  { path: '/roles', label: 'Staff/Role Management', icon: ShieldCheck },
  { path: '/settings/business', label: 'System Settings', icon: Settings },
];
