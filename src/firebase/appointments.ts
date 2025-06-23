import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase-config';
import { Appointment } from '../types';

// Add a new appointment
export async function addAppointment(data: Omit<Appointment, 'id'>) {
  await addDoc(collection(db, 'appointments'), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// Get all appointments for the current business
export async function getAppointments(businessId: string): Promise<Appointment[]> {
  const q = query(
    collection(db, 'appointments'),
    where('businessId', '==', businessId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Appointment, 'id'>),
  }));
}

// — New: only fetch for a specific doctor
export async function getDoctorAppointments(
  businessId: string,
  doctorId: string
): Promise<Appointment[]> {
  const q = query(
    collection(db, 'appointments'),
    where('businessId', '==', businessId),
    where('doctorId', '==', doctorId),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Appointment, 'id'>),
  }));
}

// Update appointment
export async function updateAppointment(id: string, data: Partial<Appointment>) {
  await updateDoc(doc(db, 'appointments', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Delete appointment
export async function deleteAppointment(id: string) {
  await deleteDoc(doc(db, 'appointments', id));
}
