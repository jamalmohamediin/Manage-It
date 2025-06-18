// src/firebase/storage.ts
import { storage, db } from './firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Upload file specific to a patient (used in legacy PatientForm/PatientList logic)
 */
export async function uploadFileForPatient(file: File, patientId: string, uploadedBy: string) {
  const path = `uploads/${patientId}/${uploadedBy}/${file.name}`;
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(result.ref);

  await addDoc(collection(db, 'uploads'), {
    patientId,
    uploadedBy,
    fileName: file.name,
    fileUrl: downloadURL,
    timestamp: serverTimestamp(),
  });

  return downloadURL;
}

/**
 * Reusable uploader for doctors, receptionists, and other roles across the app
 */
export async function uploadFileForUserRole({
  file,
  userId,
  businessId,
  role,
  context,
}: {
  file: File;
  userId: string;
  businessId: string;
  role: string;
  context?: string;
}) {
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const path = `uploads/${businessId}/${role}/${userId}/${context || 'general'}/${filename}`;
  const storageRef = ref(storage, path);
  const result = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(result.ref);

  await addDoc(collection(db, 'uploads'), {
    businessId,
    userId,
    role,
    fileName: file.name,
    fileUrl: downloadURL,
    context: context || 'general',
    uploadedAt: serverTimestamp(),
  });

  return downloadURL;
}
