import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();
  
  console.log('Usuario actual:', user);
  console.log('Rol requerido:', requiredRole);
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requiredRole) {
    console.log(`¿Tiene el rol ${requiredRole}?`, hasRole(requiredRole));
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`Usuario ${user?.email} intentó acceder a una ruta protegida sin el rol requerido ${requiredRole}`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;