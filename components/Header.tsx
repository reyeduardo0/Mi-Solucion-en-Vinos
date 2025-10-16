import React from 'react';
import { User } from '../types';
import SupabaseStatus from './SupabaseStatus';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between h-16 bg-white shadow-sm px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 md:hidden" title="Abrir menú">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        </button>
        <SupabaseStatus />
      </div>
      <div className="flex items-center">
        <div className="text-right">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>
        <button onClick={onLogout} className="ml-4 p-2 rounded-full hover:bg-gray-100" title="Cerrar sesión">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;