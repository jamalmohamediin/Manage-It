// src/firebase/roles.ts
import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { UserRole } from '../types';

export async function fetchAllRoles(businessId: string): Promise<UserRole[]> {
  const snapshot = await getDocs(collection(db, 'roles'));
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      // Only return if data has required UserRole properties
      if (data.userId && data.role && data.businessId) {
        return {
          id: doc.id,
          userId: data.userId,
          role: data.role,
          businessId: data.businessId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as UserRole;
      }
      return null;
    })
    .filter((r): r is UserRole => r !== null && r.businessId === businessId);
}

export async function removeRoleAssignment(userId: string, role: string, businessId: string): Promise<void> {
  const snapshot = await getDocs(collection(db, 'roles'));
  const match = snapshot.docs.find(
    (doc) => doc.data().userId === userId && doc.data().role === role && doc.data().businessId === businessId
  );
  if (match) await deleteDoc(doc(db, 'roles', match.id));
}

// Add the missing addUserRole function
export async function addUserRole(userId: string, role: string, businessId: string): Promise<void> {
  await addDoc(collection(db, 'roles'), {
    userId,
    role,
    businessId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}