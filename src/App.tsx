// src/App.tsx
import { useState } from "react";
import PatientForm from "./PatientForm";
import PatientList from "./PatientList";
import PatientDashboard from "./PatientDashboard.tsx"; // 👈 new component

function App() {
  const [view, setView] = useState<"doctor" | "receptionist" | "patient">("doctor");

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center text-blue-700">Manage It</h1>

      {/* View Toggle */}
      <div className="flex justify-center mb-4 space-x-4">
        <button
          className={`px-4 py-2 rounded ${view === "doctor" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setView("doctor")}
        >
          Doctor View
        </button>
        <button
          className={`px-4 py-2 rounded ${view === "receptionist" ? "bg-green-600 text-white" : "bg-gray-300"}`}
          onClick={() => setView("receptionist")}
        >
          Receptionist View
        </button>
        <button
          className={`px-4 py-2 rounded ${view === "patient" ? "bg-purple-600 text-white" : "bg-gray-300"}`}
          onClick={() => setView("patient")}
        >
          Patient View
        </button>
      </div>

      {/* Views */}
      {view === "doctor" && (
        <>
          <PatientForm />
          <PatientList />
          <div className="bg-white p-6 rounded shadow">
            <p className="text-center text-gray-600">Doctor-exclusive features coming soon...</p>
          </div>
        </>
      )}

      {view === "receptionist" && (
        <>
          <PatientForm />
          <PatientList />
        </>
      )}

      {view === "patient" && (
        <>
          <PatientDashboard />
        </>
      )}
    </div>
  );
}

export default App;
