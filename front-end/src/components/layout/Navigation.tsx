import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, hasRole, logout } = useAuth();
  
  return (
    <nav className="bg-card p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {/* El título redirige a la página apropiada según el rol */}
          <Link 
            to={hasRole('ROLE_ADMIN') ? '/' : '/games'} 
            className="font-bold text-lg"
          >
            Zona Gamer
          </Link>
          
          {/* Enlaces para todos los usuarios autenticados */}
          {isAuthenticated() && (
            <>
              <Link 
                to="/games" 
                className={`hover:text-primary ${location.pathname === '/games' ? 'text-primary font-semibold' : ''}`}
              >
                Juegos
              </Link>
              
              {/* Estadísticas disponible para todos los usuarios */}
              <Link 
                to="/stats" 
                className={`hover:text-primary ${location.pathname === '/stats' ? 'text-primary font-semibold' : ''}`}
              >
                Estadísticas
              </Link>
            </>
          )}
          
          {/* Enlaces solo para administradores */}
          {hasRole('ROLE_ADMIN') && (
            <>
              <Link 
                to="/" 
                className={`hover:text-primary ${location.pathname === '/' || location.pathname === '/home' || location.pathname === '/dashboard' ? 'text-primary font-semibold' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/create" 
                className={`hover:text-primary ${location.pathname === '/create' ? 'text-primary font-semibold' : ''}`}
              >
                Crear Juego
              </Link>
            </>
          )}
        </div>
        
        <div>
          {isAuthenticated() && (
            <button 
              onClick={logout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 