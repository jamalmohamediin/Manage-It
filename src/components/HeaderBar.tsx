import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { useRoleContext } from '../contexts/RoleContext';
import { useBusinessContext } from '../contexts/BusinessContext';
import { getBusinessById } from '../firebase/businesses';

interface HeaderBarProps {
  onToggleSidebar: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { role } = useRoleContext();
  const { businessId } = useBusinessContext();

  const [businessName, setBusinessName] = useState('—');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then((data) => {
      if (data?.name) setBusinessName(data.name);
    });
  }, [businessId]);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b shadow-sm bg-gray-50">
      {/* LEFT: Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded text-brown-700 hover:bg-yellow-50"
        >
          ☰
        </button>
      </div>

      {/* CENTER: User Info */}
      <div className="flex-1 text-center text-brown-700">
        <h1 className="text-lg font-bold">
          {user.name} | {role} | {businessName}
        </h1>
      </div>

      {/* RIGHT: Time + Icons */}
      <div className="flex items-center gap-4 text-sm text-right text-brown-700">
        <div>
          <div>{formattedDate}</div>
          <div>{formattedTime}</div>
        </div>
        <button onClick={() => navigate('/notifications')}>
          <Bell className="w-6 h-6 text-brown-700" />
        </button>
        <button onClick={() => navigate('/settings/business')}>
          <Settings className="w-6 h-6 text-brown-700" />
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
