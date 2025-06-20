import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from './firebase-config';
import { db } from './firebase-config';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';

// Universal uploader with metadata (Storage + Firestore)
export async function uploadFileWithMetadata(
  file: File,
  itemId: string,              // patientId, taskId, roleId, etc.
  businessId: string,
  role: string,                // uploader's role
  context: 'patients' | 'tasks' | 'roles',
  uploadedBy: string,          // uploader's userId
  uploaderName: string         // uploader's real name
): Promise<string> {
  try {
    // 1. Upload to Storage with modular path
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `uploads/${businessId}/${role}/${uploadedBy}/${fileName}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Save metadata in Firestore subcollection (uploads)
    const meta = {
      fileName,
      fileURL: downloadURL,
      uploadedBy,
      uploaderName,
      uploadedAt: Timestamp.now(),
      context,
      role
    };
    // e.g., patients/{id}/uploads or tasks/{id}/uploads
    await addDoc(collection(db, `${context}/${itemId}/uploads`), meta);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file with metadata:', error);
    throw new Error('Failed to upload file');
  }
}

// Load uploads metadata from Firestore for display (per patient/task/role)
export async function getUploadsForItem(
  context: 'patients' | 'tasks' | 'roles',
  itemId: string
): Promise<{ id: string; fileName: string; fileURL: string; uploadedBy: string; uploaderName?: string; uploadedAt: any; role?: string }[]> {
  const snap = await getDocs(collection(db, `${context}/${itemId}/uploads`));
  return snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as any)
  }));
}
