// src/firebase/roles.ts
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase-config';
import { UserRole } from '../types';
import { addNotification, checkExistingExpiryNotification } from './notifications';

export async function addUserRole(
  roleData: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>,
  businessId: string
) {
  const newDoc = {
    ...roleData,
    businessId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = doc(collection(db, 'roles'));
  await setDoc(ref, newDoc);

  if (roleData.expiresAt) {
    const alreadyExists = await checkExistingExpiryNotification(
      roleData.userId,
      roleData.role,
      roleData.expiresAt
    );

    if (!alreadyExists) {
      await addNotification(
        {
          userId: roleData.userId,
          title: `Your ${roleData.role} role is expiring soon`,
          body: `This role will expire on ${roleData.expiresAt}`,
        },
        {
          metaType: 'role-expiry',
          role: roleData.role,
          expiryDate: roleData.expiresAt,
        }
      );
    }
  }
}

export async function fetchAllRoles(businessId: string): Promise<UserRole[]> {
  const q = query(collection(db, 'roles'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as UserRole;
  });
}

export async function removeRoleAssignment(userId: string, role: string, businessId: string) {
  const q = query(
    collection(db, 'roles'),
    where('userId', '==', userId),
    where('role', '==', role),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, 'roles', d.id)); // ✅ correct delete usage
  }
}

export async function notifyExpiringRoles(businessId: string) {
  const q = query(collection(db, 'roles'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);

  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + 7);

  for (const d of snapshot.docs) {
    const data = d.data() as UserRole;
    if (!data.expiresAt || typeof data.expiresAt !== 'string') continue;

    const expiry = new Date(data.expiresAt);
    if (expiry >= now && expiry <= soon) {
      const exists = await checkExistingExpiryNotification(data.userId, data.role, data.expiresAt);
      if (!exists) {
        await addNotification(
          {
            userId: data.userId,
            title: `Your ${data.role} role is expiring soon`,
            body: `This role will expire on ${data.expiresAt}`,
          },
          {
            metaType: 'role-expiry',
            role: data.role,
            expiryDate: data.expiresAt,
          }
        );
      }
    }
  }
}
