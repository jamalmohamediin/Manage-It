// src/firebase/roles.ts
import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

const rolesCollection = collection(db, 'roles');

// Add a role for a user
export async function addUserRole(userId: string, role: string, businessId?: string) {
  await addDoc(rolesCollection, {
    userId,
    role,
    businessId: businessId || '',
    assignedAt: serverTimestamp(),
  });
}

// Get all roles (for admin view)
export async function fetchAllRoles() {
  const snapshot = await getDocs(rolesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{
    id: string;
    userId: string;
    role: string;
    businessId?: string;
  }>;
}

// Get roles assigned to a specific user
export async function getUserRoles(userId: string) {
  const q = query(rolesCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{
    id: string;
    userId: string;
    role: string;
    businessId?: string;
  }>;
}

// Remove a specific role assignment for a user
export async function removeRoleAssignment(userId: string, role: string) {
  const q = query(rolesCollection, where('userId', '==', userId), where('role', '==', role));
  const snapshot = await getDocs(q);
  const deletions = snapshot.docs.map(docSnap =>
    deleteDoc(doc(db, 'roles', docSnap.id))
  );
  await Promise.all(deletions);
}
