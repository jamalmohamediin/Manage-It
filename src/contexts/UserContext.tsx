// src/contexts/UserContext.tsx

import React, { createContext, useState } from "react";

// Dummy users for testing - expand as needed
const users = [
  { id: "user1", name: "Dr. Alex", role: "doctor" },
  { id: "user2", name: "Receptionist Zoe", role: "receptionist" },
  { id: "user3", name: "Admin Sam", role: "admin" },
];

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
  users: { id: string; name: string; role: string }[];
}

export const UserContext = createContext<UserContextType>({
  userId: users[0].id,
  setUserId: () => {},
  users,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState(users[0].id);

  return (
    <UserContext.Provider value={{ userId, setUserId, users }}>
      {children}
    </UserContext.Provider>
  );
};
