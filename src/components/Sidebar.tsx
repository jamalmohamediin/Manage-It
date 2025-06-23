// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/navItems';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import { getUpcomingSlatesCount } from '../firebase/patients';

interface SidebarProps {
  isVisible: boolean;
  onHideSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onHideSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const businessId = useBusinessId();
  const [business, setBusiness] = useState<any>(null);
  const [slateCount, setSlateCount] = useState<number>(0);

  useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then(setBusiness);
    getUpcomingSlatesCount(businessId).then(setSlateCount);
  }, [businessId]);

  // swipe-to-close on mobile
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => (startX = e.touches[0].clientX);
    const onMove = (e: TouchEvent) => {
      if (startX > 100 && e.touches[0].clientX - startX < -50) {
        onHideSidebar();
      }
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchmove', onMove);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
    };
  }, [onHideSidebar]);

  const logoUrl = business?.logoURL || '/default-logo.png';
  const businessName = business?.name || 'Business Name';

  return (
    <div
      className={`fixed top-0 left-0 h-full z-40 bg-gray-50 shadow transition-all duration-300 ease-in-out flex flex-col ${
        isVisible ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo & Name */}
      <div className="flex items-center px-4 pt-6 pb-4 space-x-3 bg-white border-b border-gray-200">
        <img
          src={logoUrl}
          alt="Business Logo"
          className="object-cover w-10 h-10 border border-yellow-700 rounded-full"
        />
        {isVisible && (
          <span className="text-lg font-bold truncate text-brown-700">
            {businessName}
          </span>
        )}
      </div>

      {/* Nav Items */}
      <div
        className={`mt-6 px-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const showBadge = item.path === '/slates';

            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex items-center justify-between px-4 py-2 rounded-xl font-medium transition ${
                  isActive ? 'bg-yellow-100 text-brown-700' : 'text-brown-700'
                } hover:bg-yellow-50`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {showBadge && slateCount > 0 && (
                  <span className="bg-yellow-700 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {slateCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
