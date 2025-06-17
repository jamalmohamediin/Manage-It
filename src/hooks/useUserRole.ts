// src/hooks/useUserRole.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

export const useUserRole = (userId: string) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const q = query(collection(db, 'roles'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs[0]?.data();
      setRole(data?.role || null);
      setLoading(false);
    };
    fetchRole();
  }, [userId]);

  return { role, loading };
};
