// src/components/RoleForm.tsx
import React, { useState } from 'react';
import { addUserRole } from '../firebase/roles';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const RoleForm: React.FC = () => {
  const businessId = useBusinessId();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUserRole(userId, role, businessId);
      toast.success('Role assigned');
      setUserId('');
      setRole('');
    } catch {
      toast.error('Failed to assign role');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
      <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
      <button type="submit">Assign</button>
    </form>
  );
};
export default RoleForm;
