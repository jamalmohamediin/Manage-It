import React, { useEffect, useState, useContext } from 'react';
import {
  fetchAllRoles,
  removeRoleAssignment,
  notifyExpiringRoles
} from '../firebase/roles';
import { UserRole } from '../types';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import localforage from 'localforage';
import FileUploaderModal from './FileUploaderModal';
import { UserContext } from '../contexts/UserContext';

const LOCAL_KEY_PREFIX = "roles_cache_";

const RoleList: React.FC = () => {
  const businessId = useBusinessId();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const userContext = useContext(UserContext);
  const userId = userContext?.userId ?? '';
  const users = userContext?.users ?? [];

  const uploaderName = users.find((u) => u.id === userId)?.name || "Unknown";

  useEffect(() => {
    if (businessId) notifyExpiringRoles(businessId);
  }, [businessId]);

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

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    fetchAllRoles(businessId)
      .then((data: UserRole[]) => {
        setRoles(data);
        localforage.setItem(LOCAL_KEY_PREFIX + businessId, data);
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const handleRemove = async (userId: string, role: string) => {
    if (!businessId) return;
    try {
      await removeRoleAssignment(userId, role, businessId);
      const updated = roles.filter((r) => !(r.userId === userId && r.role === role));
      setRoles(updated);
      localforage.setItem(LOCAL_KEY_PREFIX + businessId, updated);
      toast.success('Role removed');
    } catch {
      toast.error('Failed to remove role');
    }
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    return dayjs(date).diff(dayjs(), 'day') <= 7;
  };

  const openModal = (roleId: string) => {
    setSelectedRoleId(roleId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoleId(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-brown-700">User Roles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full mt-4 border-collapse table-auto">
          <thead>
            <tr className="text-brown-700 bg-gray-50">
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Expires At</th>
              <th className="px-4 py-2 border">Files</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={`${r.userId}-${r.role}`} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{r.userId}</td>
                <td className="px-4 py-2 border">{r.role}</td>
                <td className="px-4 py-2 border">
                  {r.expiresAt ? (
                    <>
                      {dayjs(r.expiresAt).format('YYYY-MM-DD')}
                      {isExpiringSoon(r.expiresAt) && (
                        <span className="ml-2 text-sm font-semibold text-red-600">(Expiring Soon!)</span>
                      )}
                    </>
                  ) : '—'}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200"
                    onClick={() => openModal(r.id!)}
                  >
                    📎 Upload/View
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleRemove(r.userId, r.role)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modalOpen && selectedRoleId && businessId && (
        <FileUploaderModal
          itemId={selectedRoleId}
          businessId={businessId}
          context="roles"
          open={modalOpen}
          onClose={closeModal}
          userId={userId}
          uploaderName={uploaderName}
        />
      )}
    </div>
  );
};

export default RoleList;
