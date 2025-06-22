import React, { useEffect, useState } from 'react';
import { getAppointments, deleteAppointment, updateAppointment } from '../firebase/appointments';
import { getPatients } from '../firebase/patients';
import { fetchAllRoles } from '../firebase/roles';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';
import { Appointment, Patient, UserRole } from '../types';
import { toast } from 'react-hot-toast';

const AppointmentList: React.FC = () => {
  const businessId = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});

  useEffect(() => {
    if (!businessId) return;
    localforage.getItem<Appointment[]>(`appointments_cache_${businessId}`).then((cached) => {
      if (cached && Array.isArray(cached)) setAppointments(cached);
      setLoading(false);
    });
  }, [businessId]);

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
      setDoctors(roles.filter(r => r.role?.toLowerCase() === "doctor"));
      localforage.setItem(`appointments_cache_${businessId}`, apps);
    })
    .finally(() => setLoading(false));
  }, [businessId]);

  const getPatientName = (id?: string) => patients.find(p => p.id === id)?.fullName || "Unknown";
  const getDoctorName = (id?: string) => doctors.find(d => d.userId === id)?.userId || "Unassigned";

  const startEdit = (app: Appointment) => {
    setEditingId(app.id!);
    setEditForm({ date: app.date, reason: app.reason, doctorId: app.doctorId || "" });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id: string) => {
    await updateAppointment(id, editForm);
    toast.success("Appointment updated");
    cancelEdit();
    if (businessId) {
      setLoading(true);
      getAppointments(businessId).then(setAppointments).finally(() => setLoading(false));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Cancel this appointment?")) {
      await deleteAppointment(id);
      toast.success("Appointment cancelled");
      setAppointments(apps => apps.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold text-brown-700">🗓️ Appointments</h2>
      {loading ? <p className="italic text-gray-500">Loading appointments...</p> : appointments.length === 0 ? (
        <p className="italic text-gray-500">No appointments found.</p>
      ) : (
        <table className="w-full text-sm border table-auto border-brown-200 rounded-xl">
          <thead className="text-brown-700 bg-gray-50">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">Reason</th>
              <th className="p-2 border">Doctor</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-yellow-50">
                <td className="p-2 border">
                  {editingId === a.id ? (
                    <input
                      type="datetime-local"
                      value={editForm.date as string || ""}
                      onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                      className="p-1 border rounded"
                    />
                  ) : a.date ? new Date(a.date).toLocaleString() : "-"}
                </td>
                <td className="p-2 border">{getPatientName(a.patientId)}</td>
                <td className="p-2 border">
                  {editingId === a.id ? (
                    <input
                      type="text"
                      value={editForm.reason as string || ""}
                      onChange={e => setEditForm(f => ({ ...f, reason: e.target.value }))}
                      className="p-1 border rounded"
                    />
                  ) : a.reason}
                </td>
                <td className="p-2 border">
                  {editingId === a.id ? (
                    <select
                      value={editForm.doctorId || ""}
                      onChange={e => setEditForm(f => ({ ...f, doctorId: e.target.value }))}
                      className="p-1 border rounded"
                    >
                      <option value="">Unassigned</option>
                      {doctors.map(d => <option key={d.userId} value={d.userId}>{d.userId}</option>)}
                    </select>
                  ) : getDoctorName(a.doctorId)}
                </td>
                <td className="p-2 space-x-2 border">
                  {editingId === a.id ? (
                    <>
                      <button onClick={() => saveEdit(a.id!)} className="text-green-700 hover:underline">Save</button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(a)} className="text-blue-700 hover:underline">Edit</button>
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
