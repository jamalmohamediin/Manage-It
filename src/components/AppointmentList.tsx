// src/components/AppointmentList.tsx
import React, { useEffect, useState } from 'react';
import { getAppointments, deleteAppointment, updateAppointment } from '../firebase/appointments';
import { getPatients } from '../firebase/patients';
import { fetchAllRoles } from '../firebase/roles';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';
import { Appointment, Patient, UserRole } from '../types';
import { toast } from 'react-hot-toast';

const LOCAL_KEY_PREFIX = "appointments_cache_";

const AppointmentList: React.FC = () => {
  const businessId = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});

  // Load from cache
  useEffect(() => {
    if (!businessId) return;
    const key = LOCAL_KEY_PREFIX + businessId;
    localforage.getItem<Appointment[]>(key).then((cached) => {
      if (cached && Array.isArray(cached)) setAppointments(cached);
      setLoading(false);
    });
  }, [businessId]);

  // Fetch from Firestore and update cache
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    Promise.all([
      getAppointments(businessId),
      getPatients(businessId),
      fetchAllRoles(businessId)
    ])
    .then(([apps, pats, roles]) => {
      setAppointments(apps);
      setPatients(pats);
      setDoctors((roles as UserRole[]).filter((r: UserRole) => r.role.toLowerCase() === "doctor"));
      const key = LOCAL_KEY_PREFIX + businessId;
      localforage.setItem(key, apps);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [businessId]);

  // Get display name
  const getPatientName = (id?: string) =>
    patients.find((p: Patient) => p.id === id)?.fullName || "Unknown";
  const getDoctorName = (id?: string) =>
    doctors.find((d: UserRole) => d.userId === id)?.userId || "Unassigned";

  // Edit handlers
  const startEdit = (app: Appointment) => {
    setEditingId(app.id!);
    setEditForm({
      date: app.date,
      reason: app.reason,
      doctorId: app.doctorId || "",
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const saveEdit = async (id: string) => {
    await updateAppointment(id, editForm);
    toast.success("Appointment updated");
    setEditingId(null);
    setEditForm({});
    // Refresh list
    if (businessId) setLoading(true);
    getAppointments(businessId!).then((apps: Appointment[]) => setAppointments(apps)).finally(() => setLoading(false));
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Cancel this appointment?")) {
      await deleteAppointment(id);
      toast.success("Appointment cancelled");
      setAppointments((apps: Appointment[]) => apps.filter((a: Appointment) => a.id !== id));
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">Appointments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#f5f5f5] text-[#3b2615]">
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Patient</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Doctor</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a: Appointment) => (
              <tr key={a.id} className="hover:bg-[#f9f9f9]">
                <td className="px-4 py-2 border">
                  {editingId === a.id ? (
                    <input
                      type="datetime-local"
                      value={editForm.date as string || ""}
                      onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                      className="p-1 border rounded"
                    />
                  ) : a.date ? new Date(a.date).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-2 border">{getPatientName(a.patientId)}</td>
                <td className="px-4 py-2 border">
                  {editingId === a.id ? (
                    <input
                      type="text"
                      value={editForm.reason as string || ""}
                      onChange={e => setEditForm(f => ({ ...f, reason: e.target.value }))}
                      className="p-1 border rounded"
                    />
                  ) : a.reason}
                </td>
                <td className="px-4 py-2 border">
                  {editingId === a.id ? (
                    <select
                      value={editForm.doctorId || ""}
                      onChange={e => setEditForm(f => ({ ...f, doctorId: e.target.value }))}
                      className="p-1 border rounded"
                    >
                      <option value="">Unassigned</option>
                      {doctors.map((d: UserRole) => (
                        <option key={d.userId} value={d.userId}>{d.userId}</option>
                      ))}
                    </select>
                  ) : getDoctorName(a.doctorId)}
                </td>
                <td className="px-4 py-2 border">
                  {editingId === a.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(a.id!)}
                        className="mr-2 text-green-700 hover:underline"
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(a)} className="mr-2 text-blue-700 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(a.id!)} className="text-red-700 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppointmentList;
