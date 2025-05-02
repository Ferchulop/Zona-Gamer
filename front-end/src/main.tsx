// Polyfill para SockJS - Asignar window a global para prevenir errores
(window as any).global = window;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Configurar interceptor para añadir el token a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById("root")!).render(<App />);
