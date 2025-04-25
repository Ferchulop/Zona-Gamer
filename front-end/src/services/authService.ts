import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const API_URL = 'http://localhost:8082/v1/auth';

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

const decodeToken = (token: string): { sub: string, name?: string, role?: string } => {
  return jwtDecode(token);
};

const authService = {
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
      // Opcional: elevar a admin si el email lo sugiere (usar con precaución)
      // role = 'ROLE_ADMIN';
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

  logout: (): void => {
    localStorage.removeItem('auth');
  },

  getCurrentAuth: (): { token: string, user: AuthUser } | null => {
    const authData = localStorage.getItem('auth');
    return authData ? JSON.parse(authData) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth');
  },

  hasRole: (role: string): boolean => {
    const auth = authService.getCurrentAuth();
    return auth?.user.role === role || false;
  },

  setAuthHeader: (token: string): void => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearAuthHeader: (): void => {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default authService;