// src/firebase/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from './firebase-config';
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

// — Business documents —

// Upload a document for a business
export async function uploadBusinessDocument(
  file: File,
  businessId: string,
  userId: string,
  uploaderName: string
): Promise<void> {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `businesses/${businessId}/documents/${fileName}`;
  const fileRef = ref(storage, filePath);
  const snap = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snap.ref);

  await addDoc(collection(db, 'businesses', businessId, 'documents'), {
    fileName,
    fileURL: url,
    uploaderId: userId,
    uploaderName,
    uploadedAt: Timestamp.now(),
    visibility: 'private',
  });
}

// Fetch all documents for a business
export async function getBusinessDocuments(businessId: string): Promise<any[]> {
  const snap = await getDocs(collection(db, 'businesses', businessId, 'documents'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

// Delete a business document (storage + metadata)
export async function deleteBusinessDocument(
  businessId: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, 'businesses', businessId, 'documents', docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as any;
    try {
      const fileRef = ref(storage, `businesses/${businessId}/documents/${data.fileName}`);
      await deleteObject(fileRef);
    } catch {
      // ignore if missing
    }
  }
  await deleteDoc(docRef);
}

// Toggle a document's visibility
export async function toggleDocumentVisibility(
  businessId: string,
  docId: string,
  makePublic: boolean
): Promise<void> {
  const docRef = doc(db, 'businesses', businessId, 'documents', docId);
  await updateDoc(docRef, { visibility: makePublic ? 'public' : 'private' });
}

// — Generic file uploads for tasks/roles/patients —

// Upload a file and save metadata under e.g. `tasks/{itemId}/uploads`
export async function uploadFileWithMetadata(
  file: File,
  itemId: string,
  businessId: string,
  role: string,
  context: string,
  uploadedBy: string,
  uploaderName: string
): Promise<void> {
  const fileName = `${Date.now()}_${file.name}`;
  const storagePath = `uploads/${businessId}/${context}/${itemId}/${fileName}`;
  const fileRef = ref(storage, storagePath);
  const snap = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(snap.ref);

  await addDoc(collection(db, context, itemId, 'uploads'), {
    fileName,
    fileURL: url,
    uploadedBy,
    uploaderName,
    uploadedAt: Timestamp.now(),
    businessId,
    role,
    context,
  });
}

// Fetch uploads list for a given context/item
export async function getUploadsForItem(
  context: string,
  itemId: string
): Promise<any[]> {
  const snap = await getDocs(collection(db, context, itemId, 'uploads'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
