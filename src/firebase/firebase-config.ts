// src/firebase-config.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBh5MThllTDwnuQ3H6s-FBFN9eUC-GCKrM",
  authDomain: "manage-it-e8765.firebaseapp.com",
  projectId: "manage-it-e8765",
  storageBucket: "manage-it-e8765.appspot.com",
  messagingSenderId: "12075864321",
  appId: "1:12075864321:web:0844628552395a5795cb00",
  measurementId: "G-K97735R82K"
};

// ✅ Ensure Firebase app is initialized only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Firestore with persistent local cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
export const firestore = db;

// ✅ Firebase Storage
export const storage = getStorage(app);

// ✅ Firebase Functions (prevents "no default app" error)
export const functions = getFunctions(app);

// ✅ Export app if needed elsewhere
export { app };
