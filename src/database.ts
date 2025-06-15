// src/database.ts
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { app } from "./firebase-config";

const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error("Offline persistence failed: multiple tabs open");
  } else if (err.code === 'unimplemented') {
    console.error("Offline persistence not available on this browser");
  }
});

export { db };
