// types.ts

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
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

// Enhanced Patient interface with comprehensive medical data
export interface Patient {
  id?: string;
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  address: string;
  businessId: string;
  ward?: string;
  triageStatus?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  specialInstructions?: string;
  medicalAidName?: string;
  medicalAidNumber?: string;
  contactNumber?: string;
  mrn?: string; // Medical Record Number
  
  // Enhanced medical information
  diagnosis?: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  hospital?: string;
  room?: string;
  bed?: string;
  
  // Comorbidities and allergies
  comorbidities?: string[];
  selectedComorbidities?: string[];
  customComorbidities?: string;
  allergies?: {
    medication?: string[];
    food?: string[];
    latex?: boolean;
    otherMedication?: string;
    otherFood?: string;
    environmental?: string[];
    severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  };
  selectedAllergies?: string[];
  customAllergies?: string;
  
  // Emergency contacts
  emergencyContacts?: {
    name: string;
    phone: string;
    relationship?: string;
    isPrimary?: boolean;
  }[];
  
  // Medical status
  admissionStatus?: 'admitted' | 'discharged' | 'pending' | 'transferred';
  admissionDate?: string;
  dischargeDate?: string;
  lengthOfStay?: number;
  
  // Vitals and monitoring
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
    bmi?: number;
    lastUpdated?: string;
    // Enhanced vitals for monitoring
    systolicBP?: number;
    diastolicBP?: number;
    pulse?: number;
    painScale?: number;
    glucoseLevel?: number;
  };
  
  // Care team
  attendingPhysician?: string;
  nurseAssigned?: string;
  careTeam?: string[];
  
  // Medications and treatments
  currentMedications?: string[];
  prescriptions?: {
    medication: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
    active: boolean;
  }[];
  
  // Procedures and investigations
  procedures?: {
    name: string;
    date: string;
    performed_by: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  investigations?: {
    type: string;
    orderDate: string;
    resultDate?: string;
    status: 'ordered' | 'in_progress' | 'completed' | 'cancelled';
    results?: string;
    critical?: boolean;
  }[];
  
  // Documentation
  notes?: string[];
  documents?: {
    type: 'image' | 'document' | 'video' | 'medical';
    name: string;
    url: string;
    uploadDate: string;
    uploadedBy: string;
  }[];
  
  // Monitoring and alerts
  abnormalVitals?: string[];
  lastTriageUpdate?: string;
  riskFactors?: string[];
  fallRisk?: 'low' | 'medium' | 'high';
  isolationPrecautions?: string[];
  
  // System fields
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
}

// Enhanced User Role interface
export interface RoleFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
}

// Enhanced User Role interface
export interface UserRole {
  id?: string;
  userId: string;
  userName: string; // Added userName
  role: string;
  businessId: string;
  permissions?: string[];
  expiresAt?: string;
  createdAt?: any;
  updatedAt?: any;
  isActive?: boolean;
  assignedBy?: string;
  department?: string;
  shift?: 'day' | 'night' | 'swing';
  specializations?: string[];
  status?: 'Active' | 'Expiring Soon' | 'Expired' | 'Pending'; // Added status
  assignedDate?: string; // Added assignedDate
  email?: string; // Added email
  phone?: string; // Added phone
  location?: string; // Added location
  files?: RoleFile[]; // Added files
}

// Enhanced Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
  readAt?: any;
  metaType?: 'vitals-alert' | 'auto-escalation' | 'triage-update' | 'role-expiry' | 'critical-alert' | 'medication' | 'appointment' | 'system';
  role?: string;
  expiryDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  data?: {
    patientId?: string;
    patientName?: string;
    alertId?: string;
    appointmentId?: string;
    medicationId?: string;
    [key: string]: any;
  };
  category?: 'medical' | 'administrative' | 'system' | 'personal';
  requiresAction?: boolean;
  dismissed?: boolean;
  dismissedAt?: any;
}

// Enhanced Appointment interface
export interface Appointment {
  id?: string;
  patientId: string;
  patientName?: string;
  businessId: string;
  date: string;
  time?: string;
  endTime?: string;
  reason: string;
  type?: 'consultation' | 'procedure' | 'follow-up' | 'emergency' | 'surgery';
  status?: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  doctorId?: string;
  doctorName?: string;
  location?: string;
  room?: string;
  duration?: number; // in minutes
  notes?: string;
  preparationInstructions?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  remindersSent?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Enhanced Prescription interface
export interface Prescription {
  id?: string;
  patientId?: string;
  patientName: string;
  patientMRN?: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  strength?: string;
  form?: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'inhaler' | 'patch';
  route?: 'oral' | 'IV' | 'IM' | 'topical' | 'inhalation' | 'sublingual';
  frequency: string;
  duration?: string;
  quantity?: number;
  refills?: number;
  
  // Dates
  dateIssued?: string;
  startDate?: string;
  endDate?: string;
  lastDispensed?: string;
  
  // Status and safety
  status?: 'active' | 'completed' | 'discontinued' | 'on-hold' | 'expired';
  discontinued?: boolean;
  discontinuedReason?: string;
  discontinuedBy?: string;
  discontinuedDate?: string;
  
  // Prescriber information
  prescribedBy?: string;
  prescriberLicense?: string;
  pharmacy?: string;
  
  // Clinical information
  indication?: string;
  contraindications?: string[];
  allergiesChecked?: boolean;
  interactionsChecked?: boolean;
  warnings?: string[];
  
  // Monitoring
  requiresMonitoring?: boolean;
  monitoringParameters?: string[];
  sideEffects?: string[];
  
  // Administrative
  priority?: 'routine' | 'urgent' | 'stat';
  cost?: number;
  insurance?: {
    covered: boolean;
    copay?: number;
    authorizationRequired?: boolean;
  };
  
  // System fields
  createdAt?: any;
  updatedAt?: any;
  version?: number;
}

// Laboratory and diagnostic results
export interface LabResult {
  id?: string;
  patientId: string;
  patientName: string;
  testName: string;
  testCode?: string;
  category?: 'hematology' | 'chemistry' | 'microbiology' | 'pathology' | 'radiology';
  orderDate: string;
  collectionDate?: string;
  resultDate?: string;
  value?: string;
  normalRange?: string;
  unit?: string;
  status: 'ordered' | 'collected' | 'in-progress' | 'completed' | 'cancelled';
  critical?: boolean;
  abnormal?: boolean;
  orderedBy: string;
  performedBy?: string;
  notes?: string;
  interpretation?: string;
  followUpRequired?: boolean;
}

// Medical alerts and monitoring
export interface MedicalAlert {
  id?: string;
  patientId: string;
  patientName: string;
  alertType: 'vital-signs' | 'medication' | 'allergy' | 'lab-result' | 'procedure' | 'fall-risk' | 'infection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  triggeredBy?: string;
  triggeredAt: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  autoGenerated?: boolean;
  requiresAction?: boolean;
  actionTaken?: string;
  escalated?: boolean;
  escalationLevel?: number;
}

// Care plans and protocols
export interface CarePlan {
  id?: string;
  patientId: string;
  patientName: string;
  planType: 'treatment' | 'discharge' | 'nursing' | 'rehabilitation' | 'palliative';
  title: string;
  description: string;
  goals: string[];
  interventions: {
    description: string;
    frequency: string;
    assignedTo: string;
    dueDate?: string;
    completed: boolean;
  }[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued' | 'on-hold';
  createdBy: string;
  reviewDate?: string;
  lastReviewed?: string;
  reviewedBy?: string;
  notes?: string[];
}

// Business and facility information
export interface Business {
  id?: string;
  name: string;
  type: 'hospital' | 'clinic' | 'practice' | 'pharmacy' | 'laboratory';
  address: string;
  phone: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  accreditation?: string[];
  departments?: string[];
  services?: string[];
  bedCapacity?: number;
  emergencyServices?: boolean;
  operatingHours?: {
    [day: string]: { open: string; close: string; closed?: boolean };
  };
  contactPerson?: string;
  settings?: {
    timezone: string;
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    security: {
      passwordPolicy: string;
      sessionTimeout: number;
      twoFactorRequired: boolean;
    };
  };
}

// Staff and user management
export interface Staff {
  id?: string;
  userId: string;
  businessId: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'technician' | 'pharmacist' | 'therapist';
  department?: string;
  specialization?: string[];
  licenseNumber?: string;
  certifications?: string[];
  shift?: 'day' | 'night' | 'swing' | 'on-call';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  hireDate?: string;
  supervisor?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  permissions?: string[];
  lastLogin?: any;
  profilePicture?: string;
}

// Audit and logging
export interface AuditLog {
  id?: string;
  userId: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: any;
  ipAddress?: string;
  userAgent?: string;
  businessId: string;
  department?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  outcome: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

// System configuration
export interface SystemConfig {
  id?: string;
  businessId: string;
  configType: 'notification' | 'security' | 'integration' | 'workflow' | 'alert';
  key: string;
  value: any;
  description?: string;
  lastModified: any;
  modifiedBy: string;
  version: number;
  environment: 'development' | 'staging' | 'production';
  sensitive?: boolean;
}

// Export all types for easy importing
// (Removed redundant export type block to avoid conflicts)

// Common enums and constants
export const PATIENT_STATUSES = {
  ADMITTED: 'admitted',
  DISCHARGED: 'discharged',
  PENDING: 'pending',
  TRANSFERRED: 'transferred'
} as const;

export const TRIAGE_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH', 
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export const NOTIFICATION_TYPES = {
  VITALS_ALERT: 'vitals-alert',
  AUTO_ESCALATION: 'auto-escalation',
  TRIAGE_UPDATE: 'triage-update',
  CRITICAL_ALERT: 'critical-alert',
  MEDICATION: 'medication',
  APPOINTMENT: 'appointment',
  SYSTEM: 'system'
} as const;

export const USER_ROLES = {
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  TECHNICIAN: 'technician',
  PHARMACIST: 'pharmacist',
  THERAPIST: 'therapist'
} as const;

export default {
  PATIENT_STATUSES,
  TRIAGE_LEVELS,
  PRIORITY_LEVELS,
  NOTIFICATION_TYPES,
  USER_ROLES
};