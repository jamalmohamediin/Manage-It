// src/components/HeaderBar.tsx
import React from 'react';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import NotificationBell from './NotificationBell';
import UserSwitcher from './UserSwitcher';

interface HeaderBarProps {
  onToggleSidebar: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleSidebar }) => {
  const businessId = useBusinessId();
  const [business, setBusiness] = React.useState<any>(null);

  React.useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then(setBusiness);
  }, [businessId]);

  const logoUrl = business?.logoUrl || '/default-logo.png'; // 🔄 Replace with your actual default logo path
  const businessName = business?.name || 'Business Name';

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white shadow">
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleSidebar}
          className="text-sm bg-[#5c3a21] text-white px-3 py-1 rounded-lg"
        >
          Toggle Sidebar
        </button>
        <div className="flex items-center gap-4">
          <img
            src={logoUrl}
            alt="Business Logo"
            className="w-10 h-10 rounded-full border border-[#5c3a21]"
          />
          <h1 className="text-xl font-bold text-[#5c3a21]">{businessName}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserSwitcher />
        <NotificationBell />
      </div>
    </div>
  );
};

export default HeaderBar;
