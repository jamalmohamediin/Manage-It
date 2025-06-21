import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../utils/navItems';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-[#fff6ec] h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#5c3a21]">Naim Investments</h2>
        <p>Your central hub for managing recruitment</p>
      </div>
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