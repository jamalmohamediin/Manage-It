import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { UserRole } from '../types';
import { addNotification, checkExistingExpiryNotification } from './notifications';
import dayjs from 'dayjs'; // Import dayjs

// Auto-create notifications for expiring roles
export async function notifyExpiringRoles(businessId: string): Promise<void> {
  const roles = await fetchAllRoles(businessId);
  const today = dayjs();
  for (const role of roles) {
    if (role.expiresAt) {
      const expiry = dayjs(role.expiresAt);
      const daysToExpiry = expiry.diff(today, 'day');
      if (daysToExpiry >= 0 && daysToExpiry <= 7) {
        const alreadyNotified = await checkExistingExpiryNotification(role.userId, role.role, expiry.format('YYYY-MM-DD'));
        if (!alreadyNotified) {
          await addNotification({
            userId: role.userId,
            title: "Role Expiry Reminder",
            body: `Your role "${role.role}" will expire on ${expiry.format('YYYY-MM-DD')}. Please renew if needed.`,
          }, {
            metaType: "role-expiry",
            role: role.role,
            expiryDate: expiry.format('YYYY-MM-DD')
          });
        }
      }
    }
  }
}

// Fetch all roles with metadata
export async function fetchAllRoles(businessId: string): Promise<UserRole[]> {
  const snapshot = await getDocs(collection(db, 'roles'));
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      if (data.userId && data.role && data.businessId) {
        return {
          id: doc.id,
          userId: data.userId,
          role: data.role,
          businessId: data.businessId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          permissions: data.permissions || [],
          expiresAt: data.expiresAt || null,
        } as UserRole;
      }
      return null;
    })
    .filter((r): r is UserRole => r !== null && r.businessId === businessId);
}

// Remove role from user
export async function removeRoleAssignment(userId: string, role: string, businessId: string): Promise<void> {
  const snapshot = await getDocs(collection(db, 'roles'));
  const match = snapshot.docs.find(
    (doc) =>
      doc.data().userId === userId &&
      doc.data().role === role &&
      doc.data().businessId === businessId
  );
  if (match) await deleteDoc(doc(db, 'roles', match.id));
}
