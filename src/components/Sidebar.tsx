// src/components/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/navItems';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 fixed top-0 left-0 h-full bg-[#fff6ec] p-4 pt-20 z-40 shadow">
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition hover:bg-[#eedccb] text-[#3b2615]"
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
