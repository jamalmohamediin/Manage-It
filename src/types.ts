// src/types.ts

export interface Task {
  id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  businessId: string;
  status: 'pending' | 'in progress' | 'done'; // New status field
  notes: string; // New notes field
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
