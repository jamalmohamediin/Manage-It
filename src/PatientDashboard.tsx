// src/PatientDashboard.tsx

const PatientDashboard = () => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Welcome, Patient</h2>
      <p>This is your personal dashboard.</p>
      <ul className="list-disc pl-6 mt-4 text-gray-700">
        <li>✔ View your personal info</li>
        <li>📅 See upcoming appointments (coming soon)</li>
        <li>📄 Upload documents / consent forms (coming later)</li>
        <li>🩺 Track your medical history (in progress)</li>
      </ul>
    </div>
  );
};

export default PatientDashboard;
