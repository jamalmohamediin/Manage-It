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

const PatientList: React.FC = () => {
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
    <div className="max-w-5xl p-6 mx-auto space-y-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-brown-700">👨‍⚕️ Registered Patients</h2>
      {patients.length === 0 ? (
        <p className="italic text-gray-500">No patients found.</p>
      ) : (
        <ul className="space-y-4">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="flex flex-col p-4 space-y-2 border rounded-lg shadow-sm bg-gray-50 md:space-y-0 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1 text-brown-700">
                <h3 className="text-lg font-semibold">{patient.fullName}</h3>
                <p className="text-sm text-gray-600">Gender: {patient.gender || "Not set"}</p>
                <p className="text-sm text-gray-600">Age: {patient.age || "Not set"}</p>
                <p className="text-sm text-gray-600">Phone: {patient.phoneNumber || "Not set"}</p>
                <p className="text-sm text-gray-600">Email: {patient.email || "Not set"}</p>
              </div>
              <div className="pt-3 md:pt-0">
                <button
                  className="px-4 py-2 font-semibold text-white transition bg-yellow-700 rounded-lg hover:bg-yellow-800"
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
