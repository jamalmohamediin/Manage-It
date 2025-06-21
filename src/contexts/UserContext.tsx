// src/contexts/UserContext.tsx

import React, { createContext, useContext, useState } from "react";

// Dummy users for testing - expand as needed
const users = [
  { id: "user1", name: "Dr. Alex", role: "doctor" },
  { id: "user2", name: "Receptionist Zoe", role: "receptionist" },
  { id: "user3", name: "Admin Sam", role: "admin" },
];

export interface User {
  id: string;
  name: string;
  role: string;
}

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
  users: User[];
  user: User;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState(users[0].id);

  const currentUser = users.find((u) => u.id === userId) || users[0];

  return (
    <UserContext.Provider value={{ userId, setUserId, users, user: currentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
