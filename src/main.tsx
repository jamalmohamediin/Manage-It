// src/main.tsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

// Optional: Import Firebase config to ensure Firestore offline mode starts up
import '../src/firebase/firebase-config';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      <App />
    </>
  </React.StrictMode>
);
