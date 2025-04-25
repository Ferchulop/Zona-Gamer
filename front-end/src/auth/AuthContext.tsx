import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthUser } from '../services/authService';

/**
 * Interfaz que define las propiedades y métodos disponibles en el contexto de autenticación.
 * Proporciona acceso al usuario actual, token, estado de carga y autenticación, etc.
 */
interface AuthContextType {
  user: AuthUser | null;         // Información del usuario autenticado o null si no hay sesión
  token: string | null;          // Token JWT de autenticación
  loading: boolean;              // Indica si hay una operación de autenticación en curso
  error: string | null;          // Mensaje de error de la última operación
  login: (email: string, password: string) => Promise<void>;  // Función para iniciar sesión
  register: (name: string, email: string, password: string, role: string) => Promise<void>; // Registro
  logout: () => void;            // Cierre de sesión
  isAuthenticated: () => boolean; // Verifica si hay un usuario autenticado
  hasRole: (role: string) => boolean; // Verifica si el usuario tiene un rol específico
}

// Creación del contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación que encapsula toda la lógica de autenticación
 * y proporciona acceso a los datos y funciones a los componentes hijos.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados para almacenar la información de autenticación
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Efecto que se ejecuta al montar el componente para cargar
   * la información del usuario desde localStorage si existe
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Intenta recuperar la sesión guardada
        const auth = authService.getCurrentAuth();
        if (auth) {
          setUser(auth.user);
          setToken(auth.token);
          // Configura el token en los headers de Axios para las peticiones futuras
          authService.setAuthHeader(auth.token);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Función para iniciar sesión con email y contraseña
   * Actualiza los estados de user y token si la autenticación es exitosa
   */
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Llama al servicio de autenticación para validar credenciales
      const auth = await authService.login({ email, password });
      setUser(auth.user);
      setToken(auth.token);
      // Configura el token en los headers para futuras peticiones
      authService.setAuthHeader(auth.token);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para registrar un nuevo usuario
   * Tras el registro exitoso, inicia sesión automáticamente
   */
  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      // Registra el usuario y obtiene el token y datos de usuario
      const { token, user } = await authService.register(name, email, password, role);
      setUser(user);
      setToken(token);
      // Configura el token en los headers para futuras peticiones
      authService.setAuthHeader(token);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   * Limpia los datos de usuario y token del estado y localStorage
   */
  const logout = () => {
    authService.logout();         // Limpia datos en localStorage
    authService.clearAuthHeader(); // Elimina el token de los headers
    setUser(null);
    setToken(null);
  };

  /**
   * Verifica si hay un usuario autenticado actualmente
   * @returns {boolean} true si hay un usuario y token válidos
   */
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * Los administradores tienen acceso a todas las rutas
   * @param {string} role - El rol requerido para verificar
   * @returns {boolean} true si el usuario tiene el rol requerido
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.role) return false;
    
    const userRole = user.role.toUpperCase();
    const requiredRole = role.toUpperCase();
    
    // Los administradores tienen acceso a todo
    if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
      return true;
    }
    
    // Verifica diferentes formatos de roles (con o sin prefijo ROLE_)
    return userRole === requiredRole || 
           userRole === `ROLE_${requiredRole}` || 
           `ROLE_${userRole}` === requiredRole;
  };

  // Objeto con todos los valores y funciones a proveer en el contexto
  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole
  };

  // Provee el contexto a los componentes hijos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @returns {AuthContextType} El contexto de autenticación
 * @throws {Error} Si se usa fuera de un AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 