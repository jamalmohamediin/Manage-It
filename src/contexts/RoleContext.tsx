import React, { createContext, useContext, useEffect, useState } from "react";

interface RoleContextType {
  role: string;
  setRole: (r: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<string>(() => {
    return localStorage.getItem("selectedRole") || "";
  });

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    localStorage.setItem("selectedRole", newRole);
  };

  // On mount, ensure localStorage is synced
  useEffect(() => {
    const saved = localStorage.getItem("selectedRole");
    if (saved && saved !== role) setRoleState(saved);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRoleContext must be used within RoleProvider");
  return ctx;
};
