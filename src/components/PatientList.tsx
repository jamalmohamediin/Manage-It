// src/components/PatientList.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import FileUploader from './FileUploader';

type Props = {
  currentRole: 'Admin' | 'Doctor' | 'Receptionist';
};

type Patient = {
  id: string;
  fullName: string;
  [key: string]: any;
};

const PatientList: React.FC<Props> = ({ currentRole }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const businessId = 'demo-business'; // Replace with real business logic later

  useEffect(() => {
    const fetchPatients = async () => {
      const snapshot = await getDocs(collection(db, 'patients'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Patient[];
      setPatients(list);
    };
    fetchPatients();
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-[#3b2615]">Registered Patients</h3>
      {patients.length === 0 ? (
        <p className="text-gray-500">No patients found.</p>
      ) : (
        <ul className="space-y-4">
          {patients.map((p) => (
            <li key={p.id} className="p-4 bg-white border rounded shadow-sm">
              <p className="font-semibold">{p.fullName}</p>
              <FileUploader
                userId={p.id}
                role={currentRole}
                businessId={businessId}
                context="patient"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList;
