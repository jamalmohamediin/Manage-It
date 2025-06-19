import React, { useEffect, useState } from 'react';
import { fetchAllRoles, removeRoleAssignment } from '../firebase/roles';
import { UserRole } from '../types';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import localforage from 'localforage';

const LOCAL_KEY_PREFIX = "roles_cache_"; // Unique per business

const RoleList: React.FC = () => {
  const businessId = useBusinessId();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Load roles from local cache first
  useEffect(() => {
    if (!businessId) return;
    const key = LOCAL_KEY_PREFIX + businessId;
    localforage.getItem<UserRole[]>(key).then((cached) => {
      if (cached && Array.isArray(cached)) {
        setRoles(cached);
      }
      setLoading(false);
    });
  }, [businessId]);

  // Then fetch from Firestore and update cache
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    fetchAllRoles(businessId)
      .then((data) => {
        setRoles(data);
        // Save latest to cache
        const key = LOCAL_KEY_PREFIX + businessId;
        localforage.setItem(key, data);
      })
      .catch(() => {
        // If Firestore fails (offline), keep local cache
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleRemove = async (userId: string, role: string) => {
    if (!businessId) return;
    try {
      await removeRoleAssignment(userId, role, businessId);
      setRoles((prev) => {
        const updated = prev.filter((r) => !(r.userId === userId && r.role === role));
        // Update cache after removal
        const key = LOCAL_KEY_PREFIX + businessId;
        localforage.setItem(key, updated);
        return updated;
      });
      toast.success('Role removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove role');
    }
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const now = dayjs();
    const expiry = dayjs(date);
    return expiry.isValid() && expiry.diff(now, 'day') <= 7;
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">User Roles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse table-auto">
          <thead>
            <tr className="bg-[#f5f5f5] text-[#3b2615]">
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Expires At</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={`${r.userId}-${r.role}`} className="hover:bg-[#f9f9f9]">
                <td className="px-4 py-2 border">{r.userId}</td>
                <td className="px-4 py-2 border">{r.role}</td>
                <td className="px-4 py-2 border">
                  {r.expiresAt ? (
                    <>
                      {dayjs(r.expiresAt).format('YYYY-MM-DD')}
                      {isExpiringSoon(r.expiresAt) && (
                        <span className="ml-2 text-sm font-semibold text-red-600">
                          (Expiring Soon!)
                        </span>
                      )}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleRemove(r.userId, r.role)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoleList;
