// Fix: Implemented the missing Sidebar component with role-based navigation.
import React from 'react';
import { Page, User, UserRole } from '../types';
import Logo from './Logo';
import DashboardIcon from './icons/DashboardIcon';
import TruckIcon from './icons/TruckIcon';
import BoxIcon from './icons/BoxIcon';
import PackageIcon from './icons/PackageIcon';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import UserIcon from './icons/UserIcon';
import DocumentChartBarIcon from './icons/DocumentChartBarIcon';
import HistoryIcon from './icons/HistoryIcon';
import TicketIcon from './icons/TicketIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}> = ({ icon, label, page, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary text-dark rounded-lg'
          : 'text-gray-300 hover:bg-dark-gray hover:text-white rounded-lg'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, user }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: <DashboardIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo, UserRole.Almacen] },
    { page: Page.Entradas, label: 'Entradas', icon: <TruckIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo, UserRole.Almacen] },
    { page: Page.Stock, label: 'Stock', icon: <BoxIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo, UserRole.Almacen] },
    { page: Page.CrearPack, label: 'Crear Pack', icon: <PackageIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Almacen] },
    { page: Page.GenerarEtiquetas, label: 'Generar Etiquetas', icon: <TicketIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Almacen] },
    { page: Page.Salidas, label: 'Salidas', icon: <ArrowUpRightIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo, UserRole.Almacen] },
    { page: Page.Incidencias, label: 'Incidencias', icon: <AlertTriangleIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo, UserRole.Almacen] },
    { page: Page.Reportes, label: 'Reportes', icon: <DocumentChartBarIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo] },
  ];
  
  const adminNavItems = [
      { page: Page.Usuarios, label: 'Usuarios', icon: <UserIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario] },
      { page: Page.Auditoria, label: 'Auditoría', icon: <HistoryIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario, UserRole.Administrativo] },
      { page: Page.Sincronizacion, label: 'Sincronización', icon: <CloudArrowUpIcon className="h-5 w-5" />, roles: [UserRole.SuperUsuario] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));
  const filteredAdminNavItems = adminNavItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-dark text-white flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavItems.map(item => (
          <NavLink
            key={item.page}
            {...item}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        ))}

        {(user.role === UserRole.SuperUsuario || user.role === UserRole.Administrativo) && (
            <>
                <div className="pt-4 mt-4 space-y-2 border-t border-gray-700">
                    <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administración</h3>
                    {filteredAdminNavItems.map(item => (
                        <NavLink
                            key={item.page}
                            {...item}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    ))}
                </div>
            </>
        )}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-center text-gray-400">
          Desarrollado Por:
        </p>
        <p className="text-sm text-center text-gray-300 font-semibold">
          Msc. Ing. Eduardo Rey
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;