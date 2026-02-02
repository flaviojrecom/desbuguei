import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as bcrypt from 'bcryptjs';

export interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  validateSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  adminPasswordHash?: string;
}

/**
 * AuthProvider manages admin authentication and session persistence.
 *
 * Session is stored in localStorage with validation on load:
 * - Session token persists across page reloads
 * - Token is validated on app load
 * - Logout clears session completely
 *
 * Password is never stored - only bcrypt hash is kept in memory
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4BlOU' // bcrypt hash of "password"
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName] = useState('Admin');

  // Validate session on mount
  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = useCallback(() => {
    try {
      const sessionToken = localStorage.getItem('auth-token');
      const sessionTime = localStorage.getItem('auth-time');

      if (!sessionToken || !sessionTime) {
        setIsAuthenticated(false);
        return false;
      }

      // Check if session is still valid (24 hours)
      const now = Date.now();
      const sessionAge = now - parseInt(sessionTime);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (sessionAge > twentyFourHours) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-time');
        setIsAuthenticated(false);
        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('[AuthContext] Error validating session:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      // Validate password against bcrypt hash
      const isValid = await bcrypt.compare(password, adminPasswordHash);

      if (!isValid) {
        console.warn('[AuthContext] Invalid password attempt');
        return false;
      }

      // Create session token (simple UUID-like token)
      const token = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-time', Date.now().toString());

      setIsAuthenticated(true);
      console.log('[AuthContext] Login successful');
      return true;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return false;
    }
  }, [adminPasswordHash]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-time');
    setIsAuthenticated(false);
    console.log('[AuthContext] Logout successful');
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    adminName,
    login,
    logout,
    validateSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
