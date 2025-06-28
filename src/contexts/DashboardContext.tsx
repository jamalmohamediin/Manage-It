import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- ENHANCED PATIENT & ALERT TYPES ---
export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  priority: string;
  diagnosis: string;
  admissionDate: string;
  ward: string;
  hospital: string;
  operation: string;
  allergies: string;
  comorbidities: string;
  height: string;
  weight: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    spo2: string;
    rr: string;
  };
  status: string;
  prescriptions: string[];
  investigations: any[];
  notes: string[];
  documents: any[];
}

// Enhanced CriticalAlert interface - backwards compatible
export interface CriticalAlert {
  id?: string;
  patientName: string;
  message: string;
  acknowledged?: boolean;
  timestamp?: string;
  // Enhanced fields - all optional for backwards compatibility
  ward?: string;
  hospital?: string;
  triage?: string;
  diagnosis?: string;
  operation?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  alertType?: 'vitals' | 'medication' | 'emergency' | 'lab' | 'other';
  contactNumber?: string;
  doctorAssigned?: string;
  priority?: number; // 1-5 scale
  // New medical fields
  comorbidities?: string;
  allergies?: string;
  height?: string;
  weight?: string;
  // Escalation tracking
  escalationHistory?: Array<{
    timestamp: string;
    escalatedBy: string;
    reason: string;
    notifiedPersons: string[];
  }>;
  // Firebase fields
  acknowledgedAt?: string;
  lastUpdated?: string;
  lastEscalated?: string;
}

// --- CONTEXT SHAPE ---
interface DashboardContextType {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  alerts: CriticalAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<CriticalAlert[]>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);

  return (
    <DashboardContext.Provider value={{ patients, setPatients, alerts, setAlerts }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
};

// --- OTHER TYPES (keeping your existing ones) ---
export interface Task {
  id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  businessId: string;
  status: 'pending' | 'in progress' | 'done' | 'cancelled';
  notes: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Renamed to avoid conflict with the main Patient interface above
export interface FirebasePatient {
  id?: string;
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  address: string;
  businessId: string;
  ward?: string;
  triageStatus?: string;
  specialInstructions?: string;
  medicalAidName?: string;
  medicalAidNumber?: string;
  medicalAidMainMember?: string;
  comorbidities?: string[];
  allergies?: {
    medication?: string[];
    food?: string[];
    latex?: boolean;
    otherMedication?: string;
    otherFood?: string;
  };
  emergencyContacts?: {
    name: string;
    phone: string;
  }[];
  admissionStatus?: 'admitted' | 'discharged' | 'pending';
  createdAt?: any;
  updatedAt?: any;
}

export interface UserRole {
  id?: string;
  userId: string;
  role: string;
  businessId: string;
  permissions?: string[];
  expiresAt?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
  metaType?: string;
  role?: string;
  expiryDate?: string;
}

export interface Appointment {
  id?: string;
  patientId: string;
  businessId: string;
  date: string;
  reason: string;
  doctorId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Prescription {
  id?: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  dateIssued?: string;
  discontinued?: boolean;
}