import React, { useEffect, useState } from 'react';
import { getAllBusinesses, Business } from '../firebase/businesses';

const BusinessList: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    getAllBusinesses().then(setBusinesses);
  }, []);

  return (
    <div className="max-w-4xl p-6 mx-auto space-y-4 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-brown-700">🏢 All Businesses</h2>
      <ul className="space-y-3">
        {businesses.map((b) => (
          <li key={b.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
            <p className="font-semibold text-brown-700">{b.name}</p>
            <p className="text-sm text-gray-600">Industry: {b.industry || 'No industry specified'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessList;
