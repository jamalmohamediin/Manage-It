// src/components/RoleForm.tsx
import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addUserRole } from '../firebase/roles';
import { toast } from 'react-hot-toast';
import { useBusinesses } from '../hooks/useBusinesses';

const RoleForm = () => {
  const [form, setForm] = useState({
    userId: '',
    businessId: '',
    role: '',
  });
  const { businesses, loading } = useBusinesses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUserRole({
      ...form,
      createdAt: Timestamp.now(),
    });
    toast.success('Role added!');
    setForm({ userId: '', businessId: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[#3b2615]">Assign Role</h2>

      <input
        type="text"
        placeholder="User ID"
        value={form.userId}
        onChange={(e) => setForm({ ...form, userId: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      />

      <select
        value={form.businessId}
        onChange={(e) => setForm({ ...form, businessId: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Business</option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Role (e.g. Admin, Shop Clerk)"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      />

      <button
        type="submit"
        className="bg-[#5c3a21] text-white px-6 py-2 rounded hover:bg-[#3b2615]"
      >
        Assign Role
      </button>
    </form>
  );
};

export default RoleForm;
