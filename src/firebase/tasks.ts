import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Task } from '../types';

const TASKS_COLLECTION = 'tasks';

export const addTask = async (task: Omit<Task, 'id'>, businessId: string) => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    businessId,
  });
  return docRef.id;
};

export const getTasks = async (businessId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
};
