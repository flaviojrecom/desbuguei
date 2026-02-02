import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Glossary } from './pages/Glossary';
import { TermDetail } from './pages/TermDetail';
import { History } from './pages/History';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { VoiceProvider } from './context/VoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HistoryProvider } from './context/HistoryContext';
import { KeyboardShortcutsManager } from './components/KeyboardShortcutsManager';
import { initializeSentry } from './utils/sentry';

// Initialize Sentry
initializeSentry();

function App() {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="w-full h-screen bg-night-bg flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Algo deu errado</h1>
            <p className="text-slate-400 mb-6">
              Desculpe, ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-dark text-night-bg font-bold px-6 py-2 rounded-lg"
            >
              Recarregar
            </button>
          </div>
        </div>
      }
      showDialog
    >
      <ThemeProvider>
        <VoiceProvider>
          <KeyboardShortcutsManager>
            <FavoritesProvider>
              <HistoryProvider>
                <HashRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="glossary" element={<Glossary />} />
                      {/* Dynamic Route for Terms */}
                      <Route path="term/:termId" element={<TermDetail />} />
                      <Route path="history" element={<History />} />
                      <Route path="favorites" element={<Favorites />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Routes>
                </HashRouter>
              </HistoryProvider>
            </FavoritesProvider>
          </KeyboardShortcutsManager>
        </VoiceProvider>
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}

export default Sentry.withProfiler(App);