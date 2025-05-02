import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/ui-custom/PageTransition';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
/* Página de acceso denegado, muestra un mensaje de error y botones para volver al inicio o atrás */
const Unauthorized = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const handleGoHome = () => {
    // Si es un usuario normal, ir a /games, si es admin ir a /dashboard
    navigate(hasRole('ROLE_ADMIN') ? '/dashboard' : '/games');
  };

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert size={64} className="text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          No tienes permisos suficientes para acceder a esta página.
          Por favor contacta al administrador si crees que esto es un error.
        </p>
        <div className="flex gap-4">
          <Button onClick={handleGoHome}>
            Ir al Inicio
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Volver Atrás
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Unauthorized; 