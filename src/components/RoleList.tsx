// src/components/RoleList.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

type UserRole = {
  id: string;
  userId: string;
  businessId: string;
  role: string;
  createdAt: any;
};

const RoleList = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const q = query(collection(db, 'roles'), where('businessId', '==', 'clinic001'));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UserRole, 'id'>),
        }));
        setRoles(list);
      } catch (err) {
        console.error('Error loading roles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">User Roles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : roles.length === 0 ? (
        <p>No roles assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {roles.map((role) => (
            <li key={role.id} className="p-4 border rounded shadow bg-white/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3b2615]">User ID: {role.userId}</p>
                  <p className="text-sm">Role: <strong>{role.role}</strong></p>
                  <p className="text-xs text-gray-500">Assigned: {new Date(role.createdAt?.toDate?.()).toLocaleString()}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoleList;

