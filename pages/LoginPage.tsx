import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage - Admin authentication portal
 *
 * Features:
 * - Password input with validation
 * - Login button with loading state
 * - Error messages for failed attempts
 * - Redirect to Settings on successful login
 * - Responsive design
 */
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!password.trim()) {
        setError('Por favor, insira a senha');
        setIsLoading(false);
        return;
      }

      const success = await login(password);

      if (success) {
        // Clear password field for security
        setPassword('');
        // Redirect to Settings (admin panel)
        navigate('/settings');
      } else {
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Desbuquei
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Painel de Administração
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Senha de Administrador
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira sua senha"
                disabled={isLoading}
                autoFocus
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-200">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 outline-none"
            >
              {isLoading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Senha armazenada com segurança (bcrypt hashing).
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
              Sessão válida por 24 horas.
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
            🔒 <strong>Segurança:</strong> Sua senha é comparada contra um hash bcrypt.
            Nunca é armazenada ou transmitida em plain text. A sessão é mantida localmente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
