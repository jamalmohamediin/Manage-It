// src/firebase-config.ts
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBh5MThllTDwnuQ3H6s-FBFN9eUC-GCKrM",
  authDomain: "manage-it-e8765.firebaseapp.com",
  projectId: "manage-it-e8765",
  storageBucket: "manage-it-e8765.appspot.com",
  messagingSenderId: "12075864321",
  appId: "1:12075864321:web:0844628552395a5795cb00",
  measurementId: "G-K97735R82K"
};

// ✅ Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// ✅ Firestore with offline persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

// ✅ Export alias for compatibility with older code
export const firestore = db;

// ✅ Firebase Storage
export const storage = getStorage(app);