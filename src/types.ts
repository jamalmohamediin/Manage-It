// src/types.ts

export type UserRoleType = 'Admin' | 'Doctor' | 'Receptionist';

export interface UserRole {
  userId: string;
  role: UserRoleType;
  businessId?: string;
  permissions?: string[];
  expiresAt?: Date;
}

