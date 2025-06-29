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
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  writeBatch,
  Timestamp
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
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  data?: Record<string, any>;
}

// Enhanced notification creation with priority and metadata
export async function addNotification({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}, meta?: { 
  metaType?: string; 
  role?: string; 
  expiryDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  data?: Record<string, any>;
}): Promise<string> {
  try {
    // Determine priority from title and metaType if not explicitly set
    let priority = meta?.priority || 'medium';
    
    if (meta?.metaType === 'auto-escalation' || title.includes('🚨')) {
      priority = 'critical';
    } else if (meta?.metaType === 'vitals-alert' || title.includes('Alert')) {
      priority = 'high';
    } else if (meta?.metaType === 'triage-update') {
      priority = 'medium';
    }

    const notificationData = {
      userId,
      title,
      body,
      read: false,
      priority,
      createdAt: serverTimestamp(),
      ...(meta || {})
    };

    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    console.log('✅ Notification created:', docRef.id, { title, priority });
    return docRef.id;
  } catch (error) {
    console.error('❌ Failed to add notification:', error);
    throw error;
  }
}

// Check for existing notifications to prevent duplicates
export async function checkExistingNotification(
  userId: string,
  title: string,
  metaType?: string,
  timeWindowMinutes: number = 5
): Promise<boolean> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    let q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("title", "==", title),
      where("createdAt", ">=", Timestamp.fromDate(fiveMinutesAgo))
    );

    if (metaType) {
      q = query(q, where("metaType", "==", metaType));
    }

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing notification:', error);
    return false;
  }
}

// Enhanced notification creation with duplicate prevention
export async function addNotificationWithDuplicateCheck({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}, meta?: { 
  metaType?: string; 
  role?: string; 
  expiryDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  data?: Record<string, any>;
}): Promise<string | null> {
  try {
    // Check for duplicates in the last 5 minutes for critical alerts
    const timeWindow = meta?.priority === 'critical' ? 5 : 1;
    const isDuplicate = await checkExistingNotification(userId, title, meta?.metaType, timeWindow);
    
    if (isDuplicate) {
      console.log('⏭️ Skipping duplicate notification:', title);
      return null;
    }

    return await addNotification({ userId, title, body }, meta);
  } catch (error) {
    console.error('Failed to add notification with duplicate check:', error);
    throw error;
  }
}

// Check for existing expiry notifications
export async function checkExistingExpiryNotification(
  userId: string,
  role: string,
  expiryDate: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("metaType", "==", "role-expiry"),
      where("role", "==", role),
      where("expiryDate", "==", expiryDate)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing expiry notification:', error);
    return false;
  }
}

// Get user notifications with enhanced filtering and sorting
export async function getUserNotifications(
  userId: string, 
  limitCount: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    let q = query(
      collection(db, "notifications"), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => {
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
        priority: data.priority || 'medium',
        actionUrl: data.actionUrl,
        data: data.data
      };
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
}

// Get notifications by priority
export async function getNotificationsByPriority(
  userId: string,
  priority: 'low' | 'medium' | 'high' | 'critical'
): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("priority", "==", priority),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error fetching notifications by priority:', error);
    throw error;
  }
}

// Mark single notification as read
export async function markAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "notifications", notifId), { 
      read: true,
      readAt: serverTimestamp()
    });
    console.log('✅ Notification marked as read:', notifId);
  } catch (error) {
    console.error('❌ Failed to mark notification as read:', error);
    throw error;
  }
}

// Mark multiple notifications as read
export async function markMultipleAsRead(notifIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    
    notifIds.forEach(id => {
      const notifRef = doc(db, "notifications", id);
      batch.update(notifRef, { 
        read: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log('✅ Multiple notifications marked as read:', notifIds.length);
  } catch (error) {
    console.error('❌ Failed to mark multiple notifications as read:', error);
    throw error;
  }
}

// Mark all user notifications as read
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        read: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log('✅ All notifications marked as read for user:', userId);
  } catch (error) {
    console.error('❌ Failed to mark all notifications as read:', error);
    throw error;
  }
}

// Delete old notifications (cleanup)
export async function deleteOldNotifications(
  userId: string, 
  daysOld: number = 30
): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("createdAt", "<=", Timestamp.fromDate(cutoffDate))
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Deleted ${snapshot.docs.length} old notifications for user:`, userId);
    return snapshot.docs.length;
  } catch (error) {
    console.error('❌ Failed to delete old notifications:', error);
    throw error;
  }
}

// Real-time notifications listener
export function subscribeToUserNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 20
): () => void {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    callback(notifications);
  }, (error) => {
    console.error('❌ Error in notifications subscription:', error);
  });
}

// Get notification statistics
export async function getNotificationStats(userId: string): Promise<{
  total: number;
  unread: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "notifications"), where("userId", "==", userId))
    );

    let total = 0;
    let unread = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      total++;
      if (!data.read) unread++;
      
      switch (data.priority) {
        case 'critical': critical++; break;
        case 'high': high++; break;
        case 'medium': medium++; break;
        case 'low': low++; break;
        default: medium++; break;
      }
    });

    return { total, unread, critical, high, medium, low };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw error;
  }
}

// Utility function for creating vitals alerts
export async function createVitalsAlert(
  userId: string,
  patientName: string,
  triageStatus: string,
  abnormalVitals: string[]
): Promise<string | null> {
  return await addNotificationWithDuplicateCheck({
    userId,
    title: `🚨 ${triageStatus} Alert - ${patientName}`,
    body: `Patient vitals indicate ${triageStatus.toLowerCase()} condition. Abnormal vitals: ${abnormalVitals.join(', ')}`
  }, {
    metaType: 'vitals-alert',
    role: 'healthcare-provider',
    priority: triageStatus === 'CRITICAL' ? 'critical' : 'high',
    data: {
      patientName,
      triageStatus,
      abnormalVitals
    }
  });
}

// Utility function for creating auto-escalation alerts
export async function createAutoEscalationAlert(
  userId: string,
  patientName: string,
  triageStatus: string,
  abnormalVitals: string[]
): Promise<string | null> {
  return await addNotificationWithDuplicateCheck({
    userId,
    title: `🚨 Auto-Escalated: ${patientName}`,
    body: `Vitals indicate ${triageStatus.toLowerCase()} condition. Abnormal: ${abnormalVitals.join(', ')}`
  }, {
    metaType: 'auto-escalation',
    role: 'healthcare-provider',
    priority: 'critical',
    data: {
      patientName,
      triageStatus,
      abnormalVitals
    }
  });
}