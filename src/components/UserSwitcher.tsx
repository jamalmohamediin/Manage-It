import React from "react";
import { useRoleContext } from "../contexts/RoleContext";

const ROLES = ["Admin", "Doctor", "Receptionist"];

const UserSwitcher: React.FC = () => {
  const { role, setRole } = useRoleContext();

  return (
    <select
      value={role}
      onChange={e => setRole(e.target.value)}
      className="p-2 rounded border bg-brown-50 text-[#3b2615] font-medium"
    >
      <option value="">Select Role</option>
      {ROLES.map(r => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
};

export default UserSwitcher;
