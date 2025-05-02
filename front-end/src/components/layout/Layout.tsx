import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../auth/AuthContext';
import AdminNotifications from '../admin/AdminNotifications';

/**
 * Interfaz que define las propiedades del componente Layout
 * @property {React.ReactNode} children 
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 
 * Este componente implementa la estructura básica de la aplicación con:
 * - Una barra lateral (Sidebar) que puede expandirse o contraerse
 * - Una cabecera con título y botón para móviles
 * - Área principal de contenido donde se renderizan los componentes hijos
 * 
 * @param {LayoutProps} props 
 * @returns {JSX.Element} 
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Estado para controlar si la barra lateral está abierta o cerrada
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Obtener información del usuario y función de logout del contexto de autenticación
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN');
  
  /**
   * Alterna el estado de la barra lateral entre abierto y cerrado
   */
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Componente de notificaciones para administradores */}
      {isAdmin && <AdminNotifications />}
      
      {/* Componente Sidebar que recibe el estado y funciones necesarias */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        user={user}
        onLogout={logout}
      />
      
      {/* Contenedor principal donde se muestra el contenido de la aplicación */}
      <main className="flex-1 overflow-auto">
        {/* Cabecera fija con botón para móviles y título */}
        <header className="h-16 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          {/* Botón para mostrar/ocultar sidebar en móviles */}
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-secondary"
          >
            <Menu size={20} />
          </button>
          <div className="text-lg font-medium">Zona Gamer</div>
          <div className="flex items-center gap-2">
            {/* Espacio para acciones adicionales en la cabecera */}
          </div>
        </header>
        
        {/* Contenedor que ajusta su margen izquierdo según el estado de la barra lateral */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          {/* Renderiza los componentes hijos (páginas y contenido) */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
