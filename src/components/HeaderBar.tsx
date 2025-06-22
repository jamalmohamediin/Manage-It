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
    <header className="flex items-center justify-between p-4 border-b bg-[#fffaf5] shadow-sm">
      <button onClick={onToggleSidebar} className="btn-primary">
        Toggle Sidebar
      </button>

      <div className="flex items-center gap-4">
        <select className="border border-gray-300 rounded px-3 py-1 text-[#3b2615] font-semibold">
          <option>Admin</option>
        </select>
        <button onClick={() => navigate('/notifications')}>
          <Bell className="w-6 h-6 text-black" />
        </button>
        <button onClick={() => navigate('/settings/business')}>
          <Settings className="w-6 h-6 text-[#3b2615]" />
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
