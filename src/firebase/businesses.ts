import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase-config';

export interface Business {
  id: string;
  name: string;
  industry?: string;
  about?: string;
  logoURL?: string;
  bannerURL?: string;
  brandColor?: string;
  website?: string;
  whatsapp?: string;
  contact?: string;
  createdAt?: Date;
}

const defaultBusinessData: Omit<Business, 'id' | 'name' | 'createdAt'> = {
  industry: 'general',
  about: 'Welcome to our business! We provide quality services with care.',
  logoURL: 'https://via.placeholder.com/100x100?text=Logo',
  bannerURL: 'https://via.placeholder.com/600x150?text=Banner',
  brandColor: '#5c3a21',
  website: '',
  whatsapp: '',
  contact: '',
};

export async function addBusiness(data: Omit<Business, 'id' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'businesses'), {
    ...defaultBusinessData,
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateBusiness(id: string, data: Partial<Business>): Promise<void> {
  const refDoc = doc(db, 'businesses', id);
  await updateDoc(refDoc, {
    ...defaultBusinessData,
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllBusinesses(): Promise<Business[]> {
  const snapshot = await getDocs(collection(db, 'businesses'));
  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      industry: d.industry,
      about: d.about,
      logoURL: d.logoURL,
      bannerURL: d.bannerURL,
      brandColor: d.brandColor ?? '#5c3a21',
      website: d.website,
      whatsapp: d.whatsapp,
      contact: d.contact,
      createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : undefined,
    };
  });
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    industry: d.industry,
    about: d.about,
    logoURL: d.logoURL,
    bannerURL: d.bannerURL,
    brandColor: d.brandColor ?? '#5c3a21',
    website: d.website,
    whatsapp: d.whatsapp,
    contact: d.contact,
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : undefined,
  };
}

// 📦 Dummy image loader
async function fetchBlobFromURL(url: string): Promise<Blob> {
  const res = await fetch(url);
  return await res.blob();
}

// 📦 Create 5 dummy businesses + upload logo & banner
export async function generateDummyBusinessesWithImages(): Promise<void> {
  const industries = ['healthcare', 'education', 'retail', 'it', 'logistics'];
  const names = ['Test Clinic A', 'Test Clinic B', 'Test Clinic C', 'Test Clinic D', 'Test Clinic E'];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const industry = industries[i % industries.length];
    const fileSafeName = name.toLowerCase().replace(/\s/g, '');

    const logoBlob = await fetchBlobFromURL(`https://via.placeholder.com/100x100?text=${encodeURIComponent(name)}`);
    const bannerBlob = await fetchBlobFromURL(`https://via.placeholder.com/600x150?text=${encodeURIComponent(name)}+Banner`);

    const logoRef = ref(storage, `businesses/${fileSafeName}/logo.jpg`);
    const bannerRef = ref(storage, `businesses/${fileSafeName}/banner.jpg`);

    await uploadBytes(logoRef, logoBlob);
    await uploadBytes(bannerRef, bannerBlob);

    const logoURL = await getDownloadURL(logoRef);
    const bannerURL = await getDownloadURL(bannerRef);

    await addBusiness({
      name,
      industry,
      about: `This is ${name} offering excellent ${industry} services.`,
      logoURL,
      bannerURL,
      brandColor: '#5c3a21',
      website: `https://${fileSafeName}.com`,
      whatsapp: '+27000000000',
      contact: `${fileSafeName}@example.com`,
    });
  }

  console.log('✅ 5 dummy businesses with images created.');
}
