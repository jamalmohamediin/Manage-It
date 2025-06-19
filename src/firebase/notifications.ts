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
}

// Add a notification for a user
export async function addNotification({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) {
  await addDoc(collection(db, "notifications"), {
    userId,
    title,
    body,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// Get all notifications for a user
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const q = query(collection(db, "notifications"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId ?? userId,      // explicitly add userId
      title: data.title ?? "",
      body: data.body ?? "",
      read: data.read ?? false,
      createdAt: data.createdAt ?? null,
    };
  });
}

// Mark notification as read
export async function markAsRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { read: true });
}
