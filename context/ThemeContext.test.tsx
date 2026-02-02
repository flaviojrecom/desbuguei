import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render as rtlRender, screen, fireEvent } from '../test-utils';
import React from 'react';
import { useTheme, ThemeProvider } from './ThemeContext';

/**
 * Test component to use the useTheme hook and expose its functionality
 */
const TestComponent = () => {
  const { themeMode, activeColor, setThemeMode, changeColor } = useTheme();

  return (
    <div>
      <div data-testid="theme-mode">{themeMode}</div>
      <div data-testid="active-color">{activeColor}</div>
      <button
        data-testid="toggle-dark-mode"
        onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
      >
        Toggle Theme
      </button>
      <button
        data-testid="change-color"
        onClick={() => changeColor('#FF5733')}
      >
        Change Color
      </button>
    </div>
  );
};

const renderWithTheme = (component: React.ReactElement) => {
  return rtlRender(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide default theme mode as dark', () => {
    renderWithTheme(<TestComponent />);

    const themeModeElement = screen.getByTestId('theme-mode');
    expect(themeModeElement).toHaveTextContent('dark');
  });

  it('should provide default primary color', () => {
    renderWithTheme(<TestComponent />);

    const colorElement = screen.getByTestId('active-color');
    expect(colorElement).toHaveTextContent('#22D3EE');
  });

  it('should toggle between light and dark modes', () => {
    renderWithTheme(<TestComponent />);

    const themeModeElement = screen.getByTestId('theme-mode');
    const toggleButton = screen.getByTestId('toggle-dark-mode');

    // Initial state: dark
    expect(themeModeElement).toHaveTextContent('dark');

    // Toggle to light
    fireEvent.click(toggleButton);
    expect(themeModeElement).toHaveTextContent('light');

    // Toggle back to dark
    fireEvent.click(toggleButton);
    expect(themeModeElement).toHaveTextContent('dark');
  });

  it('should change the primary color', () => {
    renderWithTheme(<TestComponent />);

    const colorElement = screen.getByTestId('active-color');
    const changeColorButton = screen.getByTestId('change-color');

    // Initial color
    expect(colorElement).toHaveTextContent('#22D3EE');

    // Change color
    fireEvent.click(changeColorButton);
    expect(colorElement).toHaveTextContent('#FF5733');
  });

  it('should persist theme mode to localStorage', () => {
    renderWithTheme(<TestComponent />);

    const toggleButton = screen.getByTestId('toggle-dark-mode');

    // Toggle to light mode
    fireEvent.click(toggleButton);

    // Check localStorage
    expect(localStorage.getItem('app-theme-mode')).toBe('light');
  });

  it('should persist primary color to localStorage', () => {
    renderWithTheme(<TestComponent />);

    const changeColorButton = screen.getByTestId('change-color');

    // Change color
    fireEvent.click(changeColorButton);

    // Check localStorage
    expect(localStorage.getItem('app-primary-color')).toBe('#FF5733');
  });

  it('should load persisted theme mode from localStorage', () => {
    // Set localStorage before rendering
    localStorage.setItem('app-theme-mode', 'light');

    renderWithTheme(<TestComponent />);

    const themeModeElement = screen.getByTestId('theme-mode');
    expect(themeModeElement).toHaveTextContent('light');
  });

  it('should load persisted primary color from localStorage', () => {
    // Set localStorage before rendering
    localStorage.setItem('app-primary-color', '#FF1234');

    renderWithTheme(<TestComponent />);

    const colorElement = screen.getByTestId('active-color');
    expect(colorElement).toHaveTextContent('#FF1234');
  });

  it('should provide consistent context value across re-renders', () => {
    const { rerender } = renderWithTheme(<TestComponent />);

    const themeModeElement = screen.getByTestId('theme-mode');
    const colorElement = screen.getByTestId('active-color');

    const initialTheme = themeModeElement.textContent;
    const initialColor = colorElement.textContent;

    // Rerender component
    rerender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Values should remain consistent
    expect(themeModeElement.textContent).toBe(initialTheme);
    expect(colorElement.textContent).toBe(initialColor);
  });

  it('should apply CSS variables to document element when theme mode changes', () => {
    renderWithTheme(<TestComponent />);

    const root = document.documentElement;
    const toggleButton = screen.getByTestId('toggle-dark-mode');

    // In dark mode, check that dark mode styles are set
    expect(root.style.getPropertyValue('--bg-body')).toBe('8 16 25');

    // Toggle to light mode
    fireEvent.click(toggleButton);

    // Check that light mode styles are now applied
    expect(root.style.getPropertyValue('--bg-body')).toBe('241 245 249');
  });

  it('should apply CSS variables to document element when color changes', () => {
    renderWithTheme(<TestComponent />);

    const root = document.documentElement;
    const changeColorButton = screen.getByTestId('change-color');

    // Change color
    fireEvent.click(changeColorButton);

    // Verify the CSS custom property was updated
    const primaryColor = root.style.getPropertyValue('--color-primary');
    // #FF5733 converts to RGB: 255 87 51
    expect(primaryColor).toBe('255 87 51');
  });

  it('should handle invalid hex colors gracefully', () => {
    renderWithTheme(<TestComponent />);

    // The component should still work even with edge cases
    const changeColorButton = screen.getByTestId('change-color');
    fireEvent.click(changeColorButton);

    const colorElement = screen.getByTestId('active-color');
    expect(colorElement).toHaveTextContent('#FF5733');
  });
});
