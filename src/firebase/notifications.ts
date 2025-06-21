// src/firebase/notifications.ts
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase-config";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: any;
  metaType?: string;
  role?: string;
  expiryDate?: string;
}

export async function addNotification({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}, meta?: { metaType?: string; role?: string; expiryDate?: string }) {
  await addDoc(collection(db, "notifications"), {
    userId,
    title,
    body,
    read: false,
    createdAt: serverTimestamp(),
    ...(meta || {})
  });
}

export async function checkExistingExpiryNotification(
  userId: string,
  role: string,
  expiryDate: string
): Promise<boolean> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("metaType", "==", "role-expiry"),
    where("role", "==", role),
    where("expiryDate", "==", expiryDate)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const q = query(collection(db, "notifications"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId ?? userId,
      title: data.title ?? "",
      body: data.body ?? "",
      read: data.read ?? false,
      createdAt: data.createdAt ?? null,
      metaType: data.metaType,
      role: data.role,
      expiryDate: data.expiryDate,
    };
  });
}

export async function markAsRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}
