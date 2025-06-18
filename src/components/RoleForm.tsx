import React, { useState } from 'react';
import { addUserRole } from '../firebase/roles';
import { toast } from 'react-hot-toast';

const RoleForm: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUserRole({ userId, businessId, role });
      toast.success('Role added!');
      setUserId('');
      setBusinessId('');
      setRole('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add role');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <h2 className="text-xl font-bold text-[#3b2615]">Assign Role</h2>
      <div className="grid grid-cols-3 gap-4">
        <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Business ID" value={businessId} onChange={(e) => setBusinessId(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded" />
      </div>
      <button type="submit" className="px-4 py-2 bg-[#5c3a21] text-white rounded hover:bg-[#3b2615]">
        Save Role
      </button>
    </form>
  );
};

export default RoleForm;
