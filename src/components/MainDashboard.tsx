import React from 'react';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import { useNavigate } from 'react-router-dom';

const MainDashboard: React.FC = () => {
  const businessId = useBusinessId();
  const navigate = useNavigate();
  const [business, setBusiness] = React.useState<any>(null);

  React.useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then((b) => setBusiness(b));
  }, [businessId]);

  return (
    <div className="space-y-6">
      {/* Main Content Area */}
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold">Naim Investments Limited</h2>
        <p>Your central hub for managing recruitment.</p>
        <button
          onClick={() => navigate("/dashboard/patients")}
          className="px-6 py-2 mt-4 text-white bg-yellow-400 rounded"
        >
          Go to Admin Dashboard
        </button>
        <div className="mt-4 space-y-4">
          <h3 className="font-semibold">Tasks Overview</h3>
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="text-lg">Prepare onboarding for Bob The Builder</h4>
            <div className="text-sm text-gray-700">Candidate: Bob The Builder</div>
            <div className="text-sm text-gray-700">Assigned To: Admin</div>
            <button className="text-blue-600 hover:underline">In Progress</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
