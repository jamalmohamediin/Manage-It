// src/firebase/appointments.ts
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';

export type Appointment = {
  id?: string;
  patientId: string;
  businessId: string;
  reason: string;
  date: string;
  time: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

const collectionRef = collection(db, 'appointments');

export const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  return await addDoc(collectionRef, {
    ...appointment,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};

export const getAppointments = async (): Promise<Appointment[]> => {
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Appointment, 'id'>),
  }));
};
