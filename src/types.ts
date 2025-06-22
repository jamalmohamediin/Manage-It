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

export interface Patient {
  id?: string;
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  address: string;
  businessId: string;
  medicalAidName?: string;           // ✅ NEW
  ward?: string;                     // ✅ NEW
  triageStatus?: string;             // ✅ NEW
  specialInstructions?: string;      // ✅ NEW
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
