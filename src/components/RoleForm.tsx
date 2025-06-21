// src/components/RoleForm.tsx
import React, { useState } from 'react';
import { addUserRole } from '../firebase/roles';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const availableRoles = ['Receptionist', 'Doctor', 'Admin', 'Nurse', 'Pharmacist'];
const availablePermissions = [
  'view_patients',
  'edit_patients',
  'create_tasks',
  'view_tasks',
  'manage_roles',
  'access_reports'
];

const RoleForm: React.FC = () => {
  const businessId = useBusinessId();
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckboxChange = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return toast.error('Select a business first');
    if (!userId || !role) return toast.error('User ID and Role are required');

    setSubmitting(true);
    try {
      await addUserRole(
        { userId, role, permissions, expiresAt: expiresAt || undefined },
        businessId
      );
      toast.success('Role assigned');
      setUserId('');
      setRole('');
      setPermissions([]);
      setExpiresAt('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Assign Role</h2>

      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Role</option>
        {availableRoles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <div>
        <label className="block font-medium mb-2 text-[#3b2615]">Permissions:</label>
        <div className="grid grid-cols-2 gap-2">
          {availablePermissions.map((perm) => (
            <label key={perm} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => handleCheckboxChange(perm)}
                className="mr-2"
              />
              {perm.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      </div>

      <input
        type="date"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615] disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Assign Role'}
      </button>
    </form>
  );
};

export default RoleForm;
