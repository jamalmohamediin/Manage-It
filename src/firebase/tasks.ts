// src/firebase/tasks.ts
import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export type Task = {
  id?: string;
  taskTitle: string;
  description: string;
  assignedTo: string;
  shopId: string;
  status: 'Pending' | 'Done' | 'Delayed' | 'Cancelled';
  dueDate: string;
  notes?: string;
  businessId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const tasksCol = collection(db, 'tasks');

export const addTask = async (task: Omit<Task, 'id'>) => {
  await addDoc(tasksCol, task);
};

export const getAllTasks = async (): Promise<Task[]> => {
  const snapshot = await getDocs(tasksCol);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Task),
  }));
};

export const updateTaskStatus = async (id: string, status: Task['status']) => {
  const taskRef = doc(db, 'tasks', id);
  await updateDoc(taskRef, {
    status,
    updatedAt: Timestamp.now(),
  });
};
