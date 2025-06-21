import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase-config';
import { db } from './firebase-config';
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

// Universal uploader with metadata (patients, tasks, roles)
export async function uploadFileWithMetadata(
  file: File,
  itemId: string,
  businessId: string,
  role: string,
  context: 'patients' | 'tasks' | 'roles',
  uploadedBy: string,
  uploaderName: string
): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `uploads/${businessId}/${role}/${uploadedBy}/${fileName}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const meta = {
      fileName,
      fileURL: downloadURL,
      uploadedBy,
      uploaderName,
      uploadedAt: Timestamp.now(),
      context,
      role
    };

    await addDoc(collection(db, `${context}/${itemId}/uploads`), meta);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file with metadata:', error);
    throw new Error('Failed to upload file');
  }
}

// Load uploads metadata from Firestore (per patient/task/role)
export async function getUploadsForItem(
  context: 'patients' | 'tasks' | 'roles',
  itemId: string
): Promise<{
  id: string;
  fileName: string;
  fileURL: string;
  uploadedBy: string;
  uploaderName?: string;
  uploadedAt: any;
  role?: string;
}[]> {
  const snap = await getDocs(collection(db, `${context}/${itemId}/uploads`));
  return snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as any)
  }));
}

// Upload business-level files (reports, policies, etc.)
export async function uploadBusinessDocument(
  file: File,
  businessId: string,
  uploadedBy: string,
  uploaderName: string,
  visibility: 'public' | 'private' = 'private'
): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `businesses/${businessId}/documents/${fileName}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const meta = {
      fileName,
      fileURL: downloadURL,
      uploadedAt: Timestamp.now(),
      uploadedBy,
      uploaderName,
      visibility
    };

    await addDoc(collection(db, `businesses/${businessId}/documents`), meta);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading business document:', error);
    throw new Error('Failed to upload document');
  }
}

// Get uploaded business documents
export async function getBusinessDocuments(
  businessId: string
): Promise<{
  id: string;
  fileName: string;
  fileURL: string;
  uploadedAt: any;
  uploadedBy: string;
  uploaderName: string;
  visibility?: 'public' | 'private';
}[]> {
  const snap = await getDocs(collection(db, `businesses/${businessId}/documents`));
  return snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as any)
  }));
}

// Delete a business document (Firestore + optional Storage cleanup)
export async function deleteBusinessDocument(
  businessId: string,
  docId: string,
  fileName?: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, `businesses/${businessId}/documents/${docId}`));

    if (fileName) {
      const fileRef = ref(storage, `businesses/${businessId}/documents/${fileName}`);
      await deleteObject(fileRef);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

// Toggle visibility (public/private) of a business document
export async function toggleDocumentVisibility(
  businessId: string,
  docId: string,
  makePublic: boolean
): Promise<void> {
  try {
    const docRef = doc(db, `businesses/${businessId}/documents/${docId}`);
    await updateDoc(docRef, { visibility: makePublic ? 'public' : 'private' });
  } catch (error) {
    console.error('Error toggling visibility:', error);
    throw new Error('Failed to update visibility');
  }
}
