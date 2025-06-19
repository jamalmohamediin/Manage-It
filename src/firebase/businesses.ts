// src/firebase/businesses.ts
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase-config';

export interface Business {
  id: string;
  name: string;
  industry?: string;
  createdAt?: Date;
}

// Add full business object
export async function addBusiness(data: { name: string; industry?: string; createdAt: Date }): Promise<void> {
  await addDoc(collection(db, 'businesses'), data);
}

// Get all businesses
export async function getAllBusinesses(): Promise<Business[]> {
  const snapshot = await getDocs(collection(db, 'businesses'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    industry: doc.data().industry,
    createdAt: doc.data().createdAt?.toDate(),
  }));
}
