// src/firebase/patients.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase-config';

export type Patient = {
  id: string;
  fullName: string;
  gender: string;
  age: string;
  idNumber: string;
  // Add more fields as needed based on PatientForm
};

export async function getPatients(): Promise<Patient[]> {
  const snapshot = await getDocs(collection(db, 'patients'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
}
