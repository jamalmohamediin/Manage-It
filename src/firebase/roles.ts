// src/firebase/roles.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase-config';
import { toast } from 'react-hot-toast';

export interface UserRole {
  id?: string;
  userId: string;
  role: string;
  permissions: string[];
  expiresAt?: string;
  businessId: string;
  createdAt?: string;
}

// ✅ Add a user role to Firestore
export async function addUserRole(data: Omit<UserRole, 'businessId'>, businessId: string) {
  await addDoc(collection(db, 'roles'), {
    ...data,
    businessId,
    createdAt: new Date().toISOString()
  });
}

// ✅ Fetch all roles for a business
export async function fetchAllRoles(businessId: string): Promise<UserRole[]> {
  const q = query(collection(db, 'roles'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...(doc.data() as UserRole),
    id: doc.id,
  }));
}

// ✅ Remove a user's role by userId + role + businessId
export async function removeRoleAssignment(userId: string, role: string, businessId: string) {
  const q = query(
    collection(db, 'roles'),
    where('userId', '==', userId),
    where('role', '==', role),
    where('businessId', '==', businessId)
  );

  const snapshot = await getDocs(q);
  const deletes = snapshot.docs.map((docSnap) => deleteDoc(doc(db, 'roles', docSnap.id)));
  await Promise.all(deletes);
}

// ✅ Notify about roles expiring soon (within 7 days)
export async function notifyExpiringRoles(businessId: string) {
  const q = query(collection(db, 'roles'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);

  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 7);

  const expiringRoles = snapshot.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as UserRole) }))
    .filter(role => role.expiresAt && new Date(role.expiresAt) <= soon);

  if (expiringRoles.length > 0) {
    toast(`⏰ ${expiringRoles.length} role(s) expiring within 7 days`, {
      icon: '⚠️',
    });
  }
}
