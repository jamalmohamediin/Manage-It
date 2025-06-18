// src/components/RoleForm.tsx
import React, { useState } from 'react';
import { addUserRole } from '../firebase/roles';
import { toast } from 'react-hot-toast';
import { UserRole, UserRoleType } from '../types';

const RoleForm: React.FC = () => {
  const [form, setForm] = useState<UserRole>({
    userId: '',
    role: 'Receptionist',
    businessId: '',
    permissions: [],
    expiresAt: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUserRole(form);
      toast.success('Role added!');
      setForm({ userId: '', role: 'Receptionist', businessId: '', permissions: [], expiresAt: undefined });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add role');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 mb-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Assign Role</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input
          placeholder="User ID"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as UserRoleType })}
          className="p-2 border rounded"
        >
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Receptionist">Receptionist</option>
        </select>
        <input
          placeholder="Business ID"
          value={form.businessId}
          onChange={(e) => setForm({ ...form, businessId: e.target.value })}
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          placeholder="Permissions (comma-separated)"
          value={form.permissions?.join(',') || ''}
          onChange={(e) =>
            setForm({ ...form, permissions: e.target.value.split(',').map(p => p.trim()) })
          }
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={form.expiresAt ? new Date(form.expiresAt).toISOString().split('T')[0] : ''}
          onChange={(e) =>
            setForm({ ...form, expiresAt: new Date(e.target.value) })
          }
          className="p-2 border rounded"
        />
      </div>

      <button type="submit" className="px-4 py-2 bg-[#5c3a21] text-white rounded hover:bg-[#3b2615]">
        Save Role
      </button>
    </form>
  );
};

export default RoleForm;
