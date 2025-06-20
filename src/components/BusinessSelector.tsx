import React, { useEffect, useState } from 'react';
import { getAllBusinesses, Business } from '../firebase/businesses';
import { useBusinessContext } from '../contexts/BusinessContext';

const BusinessSelector: React.FC = () => {
  const { businessId, setBusinessId } = useBusinessContext();
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    getAllBusinesses().then(setBusinesses);
  }, []);

  return (
    <select
      value={businessId}
      onChange={(e) => setBusinessId(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Select Business</option>
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name} {b.industry ? `- ${b.industry}` : ""}
        </option>
      ))}
    </select>
  );
};

export default BusinessSelector;
