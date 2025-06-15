// src/PatientList.tsx
import { useEffect, useState } from "react";
import { db } from "./firebase-config";
import { collection, onSnapshot } from "firebase/firestore";

type Patient = {
  id: string;
  fullName: string;
  phoneNumber?: string;
  age?: string;
  gender?: string;
  address?: string;
  email?: string;
};

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
      const patientData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];
      setPatients(patientData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registered Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="space-y-3">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="border rounded p-3 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg">{patient.fullName}</h3>
              <p>Gender: {patient.gender || "Not set"}</p>
              <p>Age: {patient.age || "Not set"}</p>
              <p>Phone: {patient.phoneNumber || "Not set"}</p>
              <p>Email: {patient.email || "Not set"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientList;
