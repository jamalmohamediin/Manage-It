// src/components/HeaderBar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings } from 'lucide-react';

interface HeaderBarProps {
  onToggleSidebar: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b shadow-sm bg-gray-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded text-brown-700 hover:bg-yellow-50"
        >
          ☰
        </button>

        <h1 className="text-xl font-bold text-brown-700">Manage It</h1>
      </div>

      <div className="flex items-center gap-4">
        <select className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded text-brown-700">
          <option>Admin</option>
        </select>
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
