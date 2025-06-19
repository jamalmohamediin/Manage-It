import { firestore } from './firebase-config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Appointment {
  patientName: string;
  date: string;
  time: string;
  reason: string;
  businessId: string;
}

export const addAppointment = async (appointment: Appointment) => {
  await addDoc(collection(firestore, 'appointments'), {
    ...appointment,
    createdAt: serverTimestamp(),
  });
};
