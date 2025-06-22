import { db } from './firebase-config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { Task } from '../types';
import { uploadFileWithMetadata } from './storage';

const TASKS_COLLECTION = 'tasks';

export const addTask = async (
  task: Omit<Task, 'id'>,
  businessId: string,
  uploadedBy: string,
  uploadedAt: Date,
  file?: File,
  role?: string
): Promise<string> => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    businessId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  if (file && role) {
    await uploadFileWithMetadata(
      file,
      docRef.id,
      businessId,
      role,
      'tasks',
      uploadedBy,
      uploadedAt.toISOString()
    );
  }

  return docRef.id;
};

export const getTasks = async (businessId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Task[];
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Task>,
  businessId: string
): Promise<void> => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: Timestamp.now(),
    businessId,
  });
};

export const createDummyTask = async (businessId: string): Promise<void> => {
  const dummyTask: Omit<Task, 'id'> = {
    title: 'Onboard Nurse Jane',
    description: 'Prepare login access and welcome documents',
    assignedTo: 'Admin',
    status: 'pending', // ✅ lowercase
    notes: 'Jane should start next week',
    businessId,
  };

  await addDoc(collection(db, TASKS_COLLECTION), {
    ...dummyTask,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
};
