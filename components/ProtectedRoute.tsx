import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * ProtectedRoute - Guards admin pages requiring authentication
 *
 * Usage:
 * <ProtectedRoute fallback="/login">
 *   <Settings />
 * </ProtectedRoute>
 *
 * If user is not authenticated, redirects to fallback route (default: /login)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = '/login',
}) => {
  const { isAuthenticated, validateSession } = useAuth();

  // Re-validate session on each route access
  const isValid = validateSession();

  if (!isValid || !isAuthenticated) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
