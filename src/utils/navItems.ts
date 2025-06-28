import {
  LucideIcon,
  LayoutDashboard,
  Users,
  User,
  ClipboardList,
  CalendarClock,
  Settings,
  Building,
  Building2,
  FileText,
  Bell,
  Stethoscope,
  Heart,
  Eye,
  Activity,
  FolderKanban,
  MessageSquareHeart,
  Pill,
  TestTube2,
  FlaskConical,
  FileClock,
  UserCog,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

// ✅ ADMIN & DOCTOR MAIN NAVIGATION
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Business Hub', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/alerts', label: 'Critical Alerts', icon: Bell },
  { path: '/slates', label: 'Upcoming Cases/Slates', icon: FileClock },
  { path: '/consultations', label: 'Consultations', icon: MessageSquareHeart },
  { path: '/prescriptions', label: 'Prescriptions', icon: Pill },
  { path: '/blood-results', label: 'Blood Results', icon: Heart },
  { path: '/imaging', label: 'Imaging Results', icon: Eye },
  { path: '/diagnostics', label: 'Diagnostics', icon: FlaskConical },
  { path: '/referrals', label: 'Referrals', icon: Activity },
  { path: '/notes', label: 'Notes', icon: FileText },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/appointments', label: 'Appointments', icon: CalendarClock },
  { path: '/receptionist', label: 'Receptionist View', icon: User },
  { path: '/hospital', label: 'Hospital\'s View', icon: Building2 },
  { path: '/roles/list', label: 'Staff/Role Management', icon: UserCog },
  { path: '/settings/business', label: 'System Settings', icon: Settings },
];
