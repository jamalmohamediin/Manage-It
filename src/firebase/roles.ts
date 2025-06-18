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
import { UserRole } from '../types';

const rolesCollection = collection(db, 'roles');

// ✅ Assign role (prevent duplicates)
export async function addUserRole(role: UserRole) {
  const q = query(
    rolesCollection,
    where('userId', '==', role.userId),
    where('role', '==', role.role)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('Role already assigned to this user.');
  }

  await addDoc(rolesCollection, {
    ...role,
    assignedAt: serverTimestamp(),
  });
}

// ✅ Get all roles
export async function fetchAllRoles(): Promise<UserRole[]> {
  const snapshot = await getDocs(rolesCollection);
  return snapshot.docs.map(doc => doc.data() as UserRole);
}

// ✅ Get roles by user ID
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const q = query(rolesCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserRole);
}

// ✅ Remove a specific role assignment
export async function removeRoleAssignment(userId: string, role: string) {
  const q = query(rolesCollection, where('userId', '==', userId), where('role', '==', role));
  const snapshot = await getDocs(q);
  const deletions = snapshot.docs.map(docSnap =>
    deleteDoc(doc(db, 'roles', docSnap.id))
  );
  await Promise.all(deletions);
}
