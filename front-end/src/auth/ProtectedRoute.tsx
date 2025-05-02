import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

/**
 * Interfaz para las propiedades del componente ProtectedRoute
 * @property {string} requiredRole - Rol requerido para acceder a la ruta (opcional)
 */
interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string;
}

/**
 * Componente que protege rutas basado en autenticación y roles
 * 
 * Funcionalidad:
 * 1. Verifica si el usuario está autenticado
 * 2. Si se especifica un rol requerido, verifica si el usuario tiene ese rol
 * 3. Redirige a login o página de no autorizado según corresponda
 * 4. Renderiza el contenido protegido mediante <Outlet /> si pasa las verificaciones
 * 
 * @param {ProtectedRouteProps} props - Propiedades que incluyen el rol requerido (opcional)
 * @returns Componente React que maneja la redirección o renderiza el contenido protegido
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  // Obtener funciones y datos de autenticación del contexto
  const { isAuthenticated, hasRole, user } = useAuth();
  // Obtener la ubicación actual para recordar dónde estaba intentando acceder el usuario
  const location = useLocation();
  
  console.log('Usuario actual:', user);
  console.log('Rol requerido:', requiredRole);
  
  // Paso 1: Verificar autenticación - Si no está autenticado, redirigir a login
  if (!isAuthenticated()) {
    // Guarda la ubicación actual para poder redirigir de vuelta después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Registro de depuración para verificación de roles
  if (requiredRole) {
    console.log(`¿Tiene el rol ${requiredRole}?`, hasRole(requiredRole));
  }
  
  // Paso 2: Verificar rol (si se requiere)
  // Si el usuario no tiene el rol necesario, redirigir a página de no autorizado
  if (requiredRole && !hasRole(requiredRole)) {
    console.log(`Usuario ${user?.email} intentó acceder a una ruta protegida sin el rol requerido ${requiredRole}`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // Paso 3: Si pasa todas las verificaciones, renderizar el contenido protegido
  // Renderizar children si se proporcionan, de lo contrario usar Outlet
  return children || <Outlet />;
};

export default ProtectedRoute;