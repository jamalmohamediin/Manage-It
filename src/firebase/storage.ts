// src/firebase/storage.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config';

export async function uploadFileForPatient(
  file: File, 
  patientId: string, 
  businessId: string, 
  role: string
): Promise<string> {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `patients/${businessId}/${patientId}/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

// Add the generic uploadFile function for FileUploader component
export async function uploadFile(
  file: File,
  userId: string,
  businessId: string,
  role: string,
  context: string
): Promise<string> {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `${context}/${businessId}/${userId}/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}