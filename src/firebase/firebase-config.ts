// src/firebase-config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBh5MThllTDwnuQ3H6s-FBFN9eUC-GCKrM",
  authDomain: "manage-it-e8765.firebaseapp.com",
  projectId: "manage-it-e8765",
  storageBucket: "manage-it-e8765.appspot.com",
  messagingSenderId: "12075864321",
  appId: "1:12075864321:web:0844628552395a5795cb00",
  measurementId: "G-K97735R82K"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
