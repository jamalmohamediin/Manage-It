import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase-config";
import { collection, onSnapshot } from "firebase/firestore";
import FileUploaderModal from "./FileUploaderModal";
import { useBusinessContext } from "../contexts/BusinessContext";
import { useUserContext } from "../contexts/UserContext";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { businessId } = useBusinessContext();
  const { userId, users } = useUserContext();
  const uploaderName = users.find((u) => u.id === userId)?.name || "Unknown";

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

  const openModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPatientId(null);
  };

  return (
    <div className="max-w-3xl p-4 mx-auto">
      <h2 className="mb-4 text-2xl font-bold">Registered Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul className="space-y-3">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="flex flex-col p-3 bg-white border rounded shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{patient.fullName}</h3>
                <p>Gender: {patient.gender || "Not set"}</p>
                <p>Age: {patient.age || "Not set"}</p>
                <p>Phone: {patient.phoneNumber || "Not set"}</p>
                <p>Email: {patient.email || "Not set"}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <button
                  className="px-4 py-2 text-white transition rounded-lg shadow bg-brown-800 hover:bg-brown-900"
                  onClick={() => openModal(patient.id)}
                >
                  Upload File
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && selectedPatientId && (
        <FileUploaderModal
          itemId={selectedPatientId}
          open={modalOpen}
          onClose={closeModal}
          businessId={businessId}
          context="patients"
          userId={userId}
          uploaderName={uploaderName}
        />
      )}
    </div>
  );
};

export default PatientList;
