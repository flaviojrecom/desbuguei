import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HistoryProvider } from './context/HistoryContext';

/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of the standard render() in your tests
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Router>
        <ThemeProvider>
          <FavoritesProvider>
            <HistoryProvider>{children}</HistoryProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </Router>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
// Override render with our custom render
export { customRender as render };
