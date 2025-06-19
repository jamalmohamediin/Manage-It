import React, { useEffect, useState } from 'react';
import { getPatients } from '../firebase/patients';
import { Patient } from '../types';
import { useBusinessId } from '../hooks/useBusinessId';

interface Props {
  currentRole?: string;
}

const PatientList: React.FC<Props> = ({ currentRole = 'Receptionist' }) => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (businessId) {
      getPatients(businessId).then(setPatients);
    }
  }, [businessId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Registered Patients</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-[#f5f5f5] text-[#3b2615]">
              <th className="px-4 py-2 border">Full Name</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">DOB</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Address</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-[#f9f9f9]">
                <td className="px-4 py-2 border">{patient.fullName}</td>
                <td className="px-4 py-2 border">{patient.gender}</td>
                <td className="px-4 py-2 border">{patient.idNumber}</td>
                <td className="px-4 py-2 border">{patient.dob}</td>
                <td className="px-4 py-2 border">{patient.age}</td>
                <td className="px-4 py-2 border">{patient.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;
