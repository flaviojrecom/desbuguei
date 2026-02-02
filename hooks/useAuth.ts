import { useContext } from 'react';
import AuthContext, { AuthContextType } from '../context/AuthContext';

/**
 * useAuth hook - Access authentication context
 *
 * Usage:
 * const { isAuthenticated, login, logout } = useAuth();
 *
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
