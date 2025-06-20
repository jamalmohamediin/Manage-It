import React, { useEffect, useState } from "react";
import { getPatients } from "../firebase/patients";
import { getAppointments } from "../firebase/appointments";
import { useBusinessId } from "../hooks/useBusinessId";
import { Patient, Appointment } from "../types";

const PatientDashboard: React.FC = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    Promise.all([
      getPatients(businessId),
      getAppointments(businessId),
    ]).then(([patList, appList]) => {
      setPatients(patList);
      setAppointments(appList);
      setLoading(false);
    });
  }, [businessId]);

  // Visits per patient
  const getVisitCount = (patientId: string) =>
    appointments.filter((a) => a.patientId === patientId).length;

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold text-[#3b2615] mb-6">Patient Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#f5f5f5] text-[#3b2615]">
              <th className="px-4 py-2 border">Full Name</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Visits</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-[#f9f9f9]">
                <td className="px-4 py-2 border">{p.fullName}</td>
                <td className="px-4 py-2 border">{p.gender}</td>
                <td className="px-4 py-2 border">{p.age}</td>
                <td className="px-4 py-2 font-semibold border text-brown-800">
                  {getVisitCount(p.id!)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientDashboard;
