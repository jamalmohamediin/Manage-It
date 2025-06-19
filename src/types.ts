export interface Task {
  id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  businessId: string;
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
  message: string;
  read: boolean;
  createdAt: Date;
}
