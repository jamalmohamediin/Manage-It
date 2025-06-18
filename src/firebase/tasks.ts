// src/firebase/tasks.ts
import { db } from './firebase-config';
import { collection, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { Task } from '../types';

export async function getTasks(businessId: string): Promise<Task[]> {
  const snapshot = await getDocs(collection(db, 'tasks'));
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Task))
    .filter((task) => task.businessId === businessId);
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId));
}

// Add the missing addTask function
export async function addTask(taskData: { title: string }, businessId: string): Promise<void> {
  await addDoc(collection(db, 'tasks'), {
    ...taskData,
    businessId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}