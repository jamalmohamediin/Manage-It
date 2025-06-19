// src/components/UserSwitcher.tsx

import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const UserSwitcher: React.FC = () => {
  const { userId, setUserId, users } = useContext(UserContext);

  return (
    <select
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className="p-2 mx-2 border rounded"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
};

export default UserSwitcher;
