// src/firebase/patients.ts
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase-config';
import { Patient } from '../types';

// fetch all patients for a business
export async function getPatients(businessId: string): Promise<Patient[]> {
  const snap = await getDocs(
    query(
      collection(db, 'patients'),
      where('businessId', '==', businessId)
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Patient) }));
}

// fetch only currently admitted patients
export async function getAdmittedPatients(businessId: string): Promise<Patient[]> {
  const snap = await getDocs(
    query(
      collection(db, 'patients'),
      where('businessId', '==', businessId),
      where('admissionStatus', '==', 'admitted')
    )
  );
  return snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Patient) }));
}

// fetch upcoming slates count for a business (using appointments collection)
export async function getUpcomingSlatesCount(businessId: string): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Query appointments collection for future dates
    const snap = await getDocs(
      query(
        collection(db, 'appointments'),
        where('businessId', '==', businessId),
        where('date', '>=', todayString)
      )
    );
    
    return snap.size;
  } catch (error) {
    console.error('Error getting upcoming slates count:', error);
    return 0;
  }
}