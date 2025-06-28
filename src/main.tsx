// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

// Firebase config path fixed — keep this exactly as is
import './firebase/firebase-config';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found. Make sure <div id='root'></div> exists in index.html.");
}

createRoot(container).render(
  <React.StrictMode>
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      <App />
    </>
  </React.StrictMode>
);