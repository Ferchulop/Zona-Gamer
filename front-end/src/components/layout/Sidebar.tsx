import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, List, BarChart2, PlusSquare, Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthUser } from '../../services/authService';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: AuthUser | null;
  onLogout: () => void;
}

/**
 * Componente de barra lateral navegable
 * 
 * Proporciona:
 * - Navegación principal de la aplicación
 * - Visualización de información básica del usuario
 * - Funcionalidad para cerrar sesión
 * - Modo expandido/contraído (responsive)
 * 
 * 
 * @param {SidebarProps} props - Las propiedades del componente
 * @returns {JSX.Element} La barra lateral con enlaces de navegación
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user, onLogout }) => {
  const navigate = useNavigate();

  /**
   * Maneja el cierre de sesión del usuario
   * Ejecuta la función de logout y redirige al usuario a la pantalla de login
   */
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 md:w-20 overflow-hidden"
        )}
      >
        {/* Cabecera de la barra lateral con el título y botón para contraer/expandir */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <h1 className={cn(
            "font-semibold transition-all duration-300 overflow-hidden whitespace-nowrap",
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
          )}>
            Zona Gamer
          </h1>
          <button 
            onClick={toggleSidebar}
            className="text-sidebar-foreground p-2 rounded-md hover:bg-sidebar-accent"
          >
            <Menu size={20} />
          </button>
        </div>
        
        {/* Menú de navegación principal */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {/* Enlace al Panel de Control */}
          <NavLink 
            to="/" 
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            )}
          >
            <Home size={20} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            )}>Panel de Control</span>
          </NavLink>
          
          {/* Enlace a Lista de Juegos */}
          <NavLink 
            to="/games" 
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            )}
          >
            <List size={20} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            )}>Lista de Juegos</span>
          </NavLink>
          
          {/* Enlace a Estadísticas */}
          <NavLink 
            to="/stats" 
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            )}
          >
            <BarChart2 size={20} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            )}>Estadísticas</span>
          </NavLink>
          
          {/* Enlace a Crear Juego */}
          <NavLink 
            to="/create" 
            className={({ isActive }) => cn(
              "sidebar-link",
              isActive ? "sidebar-link-active" : "sidebar-link-inactive"
            )}
          >
            <PlusSquare size={20} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            )}>Crear Juego</span>
          </NavLink>
        </nav>
        
        {/* Sección de perfil y logout en la parte inferior */}
        <div className="p-4 border-t border-sidebar-border">
          {/* Información del usuario */}
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300 overflow-hidden",
            isOpen ? "opacity-100" : "opacity-0 md:opacity-100"
          )}>
            {/* Avatar con inicial del usuario */}
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase() || 'U'}
            </div>
            {/* Nombre y email del usuario (visible solo cuando sidebar está expandido) */}
            <div className={isOpen ? "block" : "hidden"}>
              <p className="text-sm font-medium">{user?.name || user?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.email || 'email@ejemplo.com'}</p>
            </div>
          </div>
          
          {/* Botón de cerrar sesión */}
          <button 
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 w-full py-2 px-3 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:opacity-0"
            )}>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
