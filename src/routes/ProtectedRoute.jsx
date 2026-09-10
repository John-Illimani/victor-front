import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Sin Token o Usuario -> Redirigir al Login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Verificación de Roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    if (user.rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
    if (user.rol === 'DOCENTE_ACOMPANANTE') return <Navigate to="/docente-acompanante" replace />;
    if (user.rol === 'DOCENTE_GUIA') return <Navigate to="/docente-guia" replace />;
    if (user.rol === 'ESTUDIANTE') return <Navigate to="/estudiante" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};