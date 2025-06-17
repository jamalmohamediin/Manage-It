import { db } from './firebase-config'; // ✅ make sure this path is correct
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export type UserRole = {
  userId: string;
  businessId: string;
  role: string;
  createdAt: Timestamp;
};

const rolesCol = collection(db, 'roles');

export const addUserRole = async (roleData: UserRole) => {
  await addDoc(rolesCol, roleData);
};
