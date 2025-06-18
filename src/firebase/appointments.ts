// src/firebase/appointments.ts
import { db } from './firebase-config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export async function addAppointment(data: any, businessId: string) {
  return await addDoc(collection(db, 'appointments'), {
    ...data,
    businessId,
    createdAt: Timestamp.now(),
  });
}

export async function getAppointments(businessId: string) {
  const q = query(collection(db, 'appointments'), where('businessId', '==', businessId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
