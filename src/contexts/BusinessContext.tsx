// src/contexts/BusinessContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface BusinessContextType {
  businessId: string;
  setBusinessId: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessId, setBusinessId] = useState('');

  return (
    <BusinessContext.Provider value={{ businessId, setBusinessId }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusinessContext must be used within a BusinessProvider');
  return context;
};
