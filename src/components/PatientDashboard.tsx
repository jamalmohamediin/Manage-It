import React, { useEffect, useState } from 'react';
import { getPatients } from '../firebase/patients';
import { getAppointments } from '../firebase/appointments';
import { useBusinessId } from '../hooks/useBusinessId';
import { Patient, Appointment } from '../types';

const PatientDashboard: React.FC = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    Promise.all([getPatients(businessId), getAppointments(businessId)]).then(
      ([patList, appList]) => {
        setPatients(patList);
        setAppointments(appList);
        setLoading(false);
      }
    );
  }, [businessId]);

  const getVisitCount = (patientId: string) =>
    appointments.filter((a) => a.patientId === patientId).length;

  return (
    <div className="max-w-5xl p-6 mx-auto space-y-4 bg-white shadow-xl rounded-2xl text-[#3b2615]">
      <h2 className="text-3xl font-bold text-brown-700">📊 Patient Dashboard</h2>
      <p className="text-sm text-gray-500">Overview of patients and their total number of visits.</p>

      {loading ? (
        <p className="italic text-gray-500">Loading patient stats...</p>
      ) : (
        <div className="p-2 overflow-x-auto rounded-xl bg-gray-50">
          <table className="min-w-full text-sm bg-white border rounded-lg shadow-md border-brown-200">
            <thead className="text-left bg-gray-100 text-brown-700">
              <tr>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Gender</th>
                <th className="px-4 py-2 border">Age</th>
                <th className="px-4 py-2 text-center border">Total Visits</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className="border-t hover:bg-yellow-50 border-brown-100">
                  <td className="px-4 py-2 border">{p.fullName}</td>
                  <td className="px-4 py-2 border">{p.gender}</td>
                  <td className="px-4 py-2 border">{p.age}</td>
                  <td className="px-4 py-2 font-semibold text-center border text-brown-800">
                    {getVisitCount(p.id!)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
