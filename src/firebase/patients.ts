// src/firebase/patients.ts
import { db } from './firebase-config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Patient } from '../types';

const patientsCollection = collection(db, 'patients');

export async function addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>, businessId: string) {
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
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
}
