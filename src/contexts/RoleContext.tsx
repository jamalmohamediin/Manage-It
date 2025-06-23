import React, { createContext, useContext, useEffect, useState } from 'react';

interface RoleContextType {
  role: string;
  setRole: (role: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<string>(() => localStorage.getItem('selectedRole') || '');

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    localStorage.setItem('selectedRole', newRole);
  };

  useEffect(() => {
    const saved = localStorage.getItem('selectedRole');
    if (saved && saved !== role) {
      setRoleState(saved);
    }
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRoleContext must be used within a RoleProvider');
  return context;
};
