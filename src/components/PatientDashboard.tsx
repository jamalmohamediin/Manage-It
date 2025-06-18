// src/components/PatientDashboard.tsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import localforage from 'localforage';

const PatientDashboard: React.FC = () => {
  const [total, setTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const all = snapshot.docs.map((doc) => doc.data());
      setTotal(all.length);

      const today = new Date();
      const startOfDay = Timestamp.fromDate(new Date(today.setHours(0, 0, 0, 0)));
      const todayPatients = all.filter(
        (p: any) => p.createdAt?.seconds >= startOfDay.seconds
      );
      setTodayCount(todayPatients.length);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!online) {
      localforage.getItem<any[]>('cachedPatients').then((data) => {
        if (data) setCachedCount(data.length);
      });
    }
  }, [online]);

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
      <div className="p-4 text-white bg-[#5c3a21] rounded shadow">
        <p className="text-sm">Total Patients</p>
        <h3 className="text-2xl font-bold">{total}</h3>
      </div>
      <div className="p-4 text-white bg-[#3b2615] rounded shadow">
        <p className="text-sm">Registered Today</p>
        <h3 className="text-2xl font-bold">{todayCount}</h3>
      </div>
      {!online && (
        <div className="p-4 text-white bg-gray-600 rounded shadow">
          <p className="text-sm">Cached Offline</p>
          <h3 className="text-2xl font-bold">{cachedCount}</h3>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
