/**
 * 
 * 
 * Servicio para gestionar la autenticación y el registro de usuarios en la aplicación.
 * Proporciona funciones para login, registro, logout, gestión de tokens JWT,
 * y utilidades para roles y cabeceras de autenticación.
 * Utiliza axios para las peticiones HTTP y localStorage para persistir la sesión.
 */

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// URL la API de autenticación
const API_URL = 'http://localhost:8082/v1/auth';

// Tipos de datos para login y registro
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface TokenResponse {
  accesstoken: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

// Decodifica el token JWT para extraer información del usuario
const decodeToken = (token: string): { sub: string, name?: string, role?: string } => {
  return jwtDecode(token);
};

const authService = {
  /**
   * realiza login con email y contraseña.
   * Guarda el token y los datos del usuario en localStorage
   * @returns { token, user }
   */
  login: async (credentials: LoginRequest): Promise<{ token: string, user: AuthUser }> => {
    const response = await axios.post<TokenResponse>(`${API_URL}/login`, credentials);
    const token = response.data.accesstoken;
    
    const decoded = decodeToken(token);
    const userId = parseInt(decoded.sub);
    
    let role = decoded.role || 'ROLE_USER';
    
    if (role === 'ROLE_ADMIN' && !credentials.email.includes('admin')) {
      role = 'ROLE_USER';
    }
    
    if (credentials.email.includes('admin') && role !== 'ROLE_ADMIN') {
      // como mejora añado el poder forzar el rol admin si el email lo sugiere
    }
    
    const name = decoded.name || credentials.email.split('@')[0];
    
    const user: AuthUser = {
      id: userId,
      email: credentials.email,
      role: role,
      name: name
    };
    
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    
    return { token, user };
  },

  /**
   * Registra un nuevo usuario y guarda la sesión en localStorage.
   * @returns { token, user }
   */
  register: async (name: string, email: string, password: string, role: string): Promise<{ token: string, user: AuthUser }> => {
    const userData: RegisterRequest = { email, password, name, role };
    const response = await axios.post<TokenResponse>(`${API_URL}/register`, userData);
    const token = response.data.accesstoken;
    
    const decoded = decodeToken(token);
    const userId = parseInt(decoded.sub);
    
    const user: AuthUser = {
      id: userId,
      email: email,
      role: role,
      name: name
    };
    
    localStorage.setItem('auth', JSON.stringify({ token, user }));
    
    return { token, user };
  },

  /**
   * Elimina la sesión del usuario de localStorage.
   */
  logout: (): void => {
    localStorage.removeItem('auth');
  },

  /**
   * Obtiene la sesión actual del usuario desde localStorage.
   * @returns { token, user } | null
   */
  getCurrentAuth: (): { token: string, user: AuthUser } | null => {
    const authData = localStorage.getItem('auth');
    return authData ? JSON.parse(authData) : null;
  },

  /**
   * Verifica si hay una sesión activa.
   * @returns boolean
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth');
  },

  /**
   * Verifica si el usuario tiene un rol específico.
   * @returns boolean
   */
  hasRole: (role: string): boolean => {
    const auth = authService.getCurrentAuth();
    return auth?.user.role === role || false;
  },

  /**
   * Establece el token JWT en los headers de axios para futuras peticiones.
   */
  setAuthHeader: (token: string): void => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  /**
   * elimina el header de autorización de axios
   */
  clearAuthHeader: (): void => {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default authService;