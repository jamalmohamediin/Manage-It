// src/components/BusinessList.tsx
import React, { useEffect, useState } from 'react';
import { getAllBusinesses, Business } from '../firebase/businesses';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    getAllBusinesses().then(setBusinesses);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">All Businesses</h2>
      <ul className="space-y-2">
        {businesses.map((b) => (
          <li key={b.id} className="p-2 border rounded bg-white/60">
            <strong>{b.name}</strong> – {b.industry || 'No industry'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessList;
