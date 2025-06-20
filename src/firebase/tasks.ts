import { db } from './firebase-config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Task } from '../types';
import { uploadFileWithMetadata } from './storage';

const TASKS_COLLECTION = 'tasks';

// Add task with metadata, status, and notes
export const addTask = async (
  task: Omit<Task, 'id'>, 
  businessId: string, 
  uploadedBy: string,
  uploadedAt: Date,
  file?: File, // Optional file parameter
  role?: string // Optional role parameter
) => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...task,
    businessId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Handle file upload with metadata if a file is provided
  if (file && role) {
    const fileURL = await uploadFileWithMetadata(
      file,
      docRef.id, // Use task document ID as itemId
      businessId,
      role,
      'tasks', // context for files
      uploadedBy,
      uploadedAt.toISOString() // Convert Date to string
    );
    
    // Optionally, you might want to update the task document with the file URL
    // await updateDoc(doc(db, TASKS_COLLECTION, docRef.id), { fileURL });
  }

  return docRef.id;
};

// Fetch tasks from Firestore
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
