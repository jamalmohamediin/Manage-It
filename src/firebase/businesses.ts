// src/firebase/businesses.ts
import { db } from './firebase-config';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

export type Business = {
  id?: string;
  name: string;
  industry?: string;
  createdAt: Timestamp;
};

const businessCol = collection(db, 'businesses');

export const addBusiness = async (biz: Omit<Business, 'id'>) => {
  await addDoc(businessCol, biz);
};

export const getAllBusinesses = async (): Promise<Business[]> => {
  const snapshot = await getDocs(businessCol);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Business),
  }));
};
