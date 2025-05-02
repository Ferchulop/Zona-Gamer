import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/auth/AuthContext';
import TestNotification from './components/admin/TestNotification';

// Páginas públicas
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

// Páginas protegidas
import Home from '@/pages/Home';
import GameList from '@/pages/GameList';
import GameStats from '@/pages/GameStats';
import CreateGame from '@/pages/CreateGame';

// Toaster para notificaciones
import { Toaster } from '@/components/ui/toaster';

// Componente para manejar la redirección de la ruta raíz
const RootRedirect = () => {
  const { hasRole } = useAuth();
  return <Navigate to={hasRole('ROLE_ADMIN') ? '/dashboard' : '/games'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas para usuarios normales */}
          <Route element={<ProtectedRoute />}>
            <Route path="/games" element={<Layout><GameList /></Layout>} />
            <Route path="/stats" element={<Layout><GameStats /></Layout>} />
          </Route>
          
          {/* Rutas solo para administradores */}
          <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/home" element={<Layout><Home /></Layout>} />
            <Route path="/dashboard" element={<Layout><Home /></Layout>} />
            <Route path="/create" element={<Layout><CreateGame /></Layout>} />
          </Route>

          {/* Ruta de prueba para notificaciones */}
          <Route path="/admin/test-notifications" element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <Layout>
                <div className="p-4">
                  <h1 className="text-2xl font-bold mb-4">Prueba de Notificaciones</h1>
                  <TestNotification />
                </div>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Ruta por defecto para usuarios normales */}
          <Route path="*" element={<Navigate to="/games" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
