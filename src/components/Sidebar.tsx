import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/navItems'; // ✅ BACK TO ORIGINAL NAV
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';

interface SidebarProps {
  isVisible: boolean;
  onHideSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onHideSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const businessId = useBusinessId();
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then(setBusiness);
  }, [businessId]);

  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const handleTouchMove = (e: TouchEvent) => {
      const diffX = e.touches[0].clientX - startX;
      if (startX > 100 && diffX < -50) onHideSidebar();
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onHideSidebar]);

  const logoUrl = business?.logoURL || '/default-logo.png';
  const businessName = business?.name || 'Business Name';

  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 bg-[#fff6ec] shadow transition-all duration-300 ease-in-out flex flex-col ${
        isVisible ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo and Business Name */}
      <div className="flex items-center px-4 pt-6 pb-4 space-x-3 border-b border-[#e0cdbb]">
        <img
          src={logoUrl}
          alt="Business Logo"
          className="w-10 h-10 rounded-full border border-[#5c3a21] object-cover"
        />
        {isVisible && (
          <span className="text-lg font-bold text-[#5c3a21] truncate">{businessName}</span>
        )}
      </div>

      {/* Navigation */}
      <div
        className={`transition-all duration-300 ease-in-out mt-6 px-2 overflow-hidden ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  isActive ? 'bg-[#dbc8b7] text-[#3b2615]' : 'text-[#3b2615]'
                } hover:bg-[#eedccb]`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
