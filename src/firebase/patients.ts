import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Patient } from '../types';

const patientsCollection = collection(db, 'patients');

export async function addPatient(
  patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>,
  businessId: string
) {
  return await addDoc(patientsCollection, {
    ...patient,
    businessId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function getPatients(businessId: string): Promise<Patient[]> {
  const q = query(patientsCollection, where('businessId', '==', businessId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Patient));
}

// ✅ NEW — Get count of upcoming slates
export async function getUpcomingSlatesCount(businessId: string): Promise<number> {
  const today = new Date();
  const q = query(patientsCollection, where('businessId', '==', businessId));
  const snapshot = await getDocs(q);

  const upcomingPatients = snapshot.docs.filter((doc) => {
    const patient = doc.data() as Patient;
    if (!patient || !patient.dob) return false;

    try {
      const scheduledDate = new Date(patient.dob);
      return scheduledDate >= today;
    } catch {
      return false;
    }
  });

  return upcomingPatients.length;
}
