export interface Patient {
  id: string;
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  religion: string;
  medicalAidName: string;
  medicalAidNumber: string;
  medicalAidMainMember: string;
  emergencyContact1: { name: string; phone: string };
  emergencyContact2: { name: string; phone: string };
  address: string;
  createdAt: any;
  updatedAt: any;
  businessId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  businessId: string;
}

export interface UserRole {
  userId: string;
  role: 'Admin' | 'Doctor' | 'Receptionist';
  businessId: string;
}
