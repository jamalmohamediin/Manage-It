// src/components/RoleList.tsx
import React, { useEffect, useState } from 'react';
import { fetchAllRoles, removeRoleAssignment } from '../firebase/roles';
import FileUploader from './FileUploader';

type UserRole = {
  userId: string;
  role: string;
  businessId?: string;
};

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllRoles();
      setRoles(data);
    };
    load();
  }, []);

  const handleDelete = async (role: UserRole) => {
    try {
      await removeRoleAssignment(role.userId, role.role);
      setRoles((prev) =>
        prev.filter((r) => r.userId !== role.userId || r.role !== role.role)
      );
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#3b2615] mb-4">Assigned Roles</h3>
      {roles.map((role) => (
        <div
          key={`${role.userId}-${role.role}`}
          className="flex flex-col gap-2 p-4 bg-white border rounded shadow"
        >
          <p>
            <strong>{role.role}</strong> - {role.userId}
          </p>
          <FileUploader
            userId={role.userId}
            role={role.role}
            businessId={role.businessId ?? ''}
            context="role"
          />
          <button
            onClick={() => handleDelete(role)}
            className="self-start mt-2 text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default RoleList;
