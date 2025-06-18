import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export type Task = {
  id?: string;
  title: string;
  description: string;
  createdAt?: Timestamp;
};

const taskRef = collection(db, 'tasks');

export const addTask = async (task: Omit<Task, 'id'>) => {
  await addDoc(taskRef, {
    ...task,
    createdAt: Timestamp.now(),
  });
};

export const getTasks = async (): Promise<Task[]> => {
  const snap = await getDocs(taskRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
};

export const deleteTask = async (id: string) => {
  await deleteDoc(doc(db, 'tasks', id));
};
