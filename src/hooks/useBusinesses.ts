// src/hooks/useBusinesses.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const snapshot = await getDocs(collection(db, 'businesses'));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed',
      }));
      setBusinesses(list);
      setLoading(false);
    };

    fetchBusinesses();
  }, []);

  return { businesses, loading };
};
