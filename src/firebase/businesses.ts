import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-config';

export interface Business {
  id: string;
  name: string;
  industry?: string;
  createdAt?: Date;
}

// Add full business object
export async function addBusiness(data: { name: string; industry?: string }): Promise<void> {
  await addDoc(collection(db, 'businesses'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// Get all businesses
export async function getAllBusinesses(): Promise<Business[]> {
  const snapshot = await getDocs(collection(db, 'businesses'));
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      industry: d.industry,
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : undefined,
    };
  });
}
