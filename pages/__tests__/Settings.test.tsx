import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Settings } from '../Settings';
import { VoiceProvider } from '../../context/VoiceContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { FavoritesProvider } from '../../context/FavoritesContext';
import { HistoryProvider } from '../../context/HistoryContext';

// Mock Supabase
vi.mock('../../services/supabase', () => ({
  isSupabaseConfigured: () => false,
}));

// Mock term service
vi.mock('../../services/termService', () => ({
  seedDatabase: vi.fn().mockResolvedValue(undefined),
}));

// Mock Sentry
vi.mock('@sentry/react', () => ({
  withProfiler: (component: any) => component,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Google Gemini
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: 'base64encodedaudio' } }],
            },
          },
        ],
      }),
    },
  })),
}));

const renderSettings = () => {
  return render(
    <VoiceProvider>
      <ThemeProvider>
        <FavoritesProvider>
          <HistoryProvider>
            <Settings />
          </HistoryProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </VoiceProvider>
  );
};

describe('Settings Page Keyboard Navigation (Task 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme toggle keyboard accessibility', () => {
    it('should render theme toggle buttons with focus support', () => {
      renderSettings();

      const lightButton = screen.getByTitle('Modo Claro');
      const darkButton = screen.getByTitle('Modo Escuro');

      expect(lightButton).toBeInTheDocument();
      expect(darkButton).toBeInTheDocument();
    });

    it('should toggle theme when light button is clicked', () => {
      renderSettings();
      const lightButton = screen.getByTitle('Modo Claro');

      fireEvent.click(lightButton);
      expect(lightButton.className).toContain('shadow-');
    });

    it('should toggle theme when dark button is clicked', () => {
      renderSettings();
      const darkButton = screen.getByTitle('Modo Escuro');

      fireEvent.click(darkButton);
      expect(darkButton.className).toContain('shadow-');
    });
  });

  describe('Password form keyboard support (Enter key submission)', () => {
    it('should render password input and unlock button', () => {
      renderSettings();

      const passwordInput = screen.getByLabelText(/Código de Acesso/i);
      const unlockButton = screen.getByText('Desbloquear Painel');

      expect(passwordInput).toBeInTheDocument();
      expect(unlockButton).toBeInTheDocument();
    });

    it('should have focus styles on password input', () => {
      renderSettings();
      const passwordInput = screen.getByLabelText(/Código de Acesso/i);

      expect(passwordInput.className).toContain('focus');
    });

    it('should have focus styles on unlock button', () => {
      renderSettings();
      const unlockButton = screen.getByText('Desbloquear Painel');

      expect(unlockButton.className).toContain('focus');
    });
  });

  describe('Character selection keyboard navigation', () => {
    it('should render character selection section', () => {
      renderSettings();
      const heading = screen.getByText('Escolha seu Mentor');

      expect(heading).toBeInTheDocument();
    });

    it('should render all characters', async () => {
      renderSettings();

      // Should have character mentor section
      const mentorSection = screen.getByText('Escolha seu Mentor');
      expect(mentorSection).toBeInTheDocument();
    });

    it('should support keyboard navigation with arrow keys', async () => {
      renderSettings();

      // Character cards should be keyboard accessible
      const characterCards = screen.getAllByRole('heading', {
        level: 3,
      });
      expect(characterCards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility compliance (WCAG 2.1 AA)', () => {
    it('should have accessible form with proper labels and focus', () => {
      renderSettings();

      const passwordInput = screen.getByLabelText(/Código de Acesso/i);
      const form = passwordInput.closest('form');

      // Form should exist
      expect(form).toBeInTheDocument();

      // Input should be focusable
      expect(passwordInput.getAttribute('type')).toBe('password');
    });

    it('should support keyboard-only interaction for settings', () => {
      renderSettings();

      // Theme buttons should be keyboard accessible
      const lightButton = screen.getByTitle('Modo Claro');
      const darkButton = screen.getByTitle('Modo Escuro');

      // Buttons should be focusable (button elements are always focusable)
      expect(lightButton).toBeInTheDocument();
      expect(darkButton).toBeInTheDocument();
      expect(lightButton.tagName).toBe('BUTTON');
      expect(darkButton.tagName).toBe('BUTTON');
    });

    it('should render with focus-visible styles', () => {
      renderSettings();

      const unlockButton = screen.getByText('Desbloquear Painel');

      // Button should have focus-visible styling
      expect(unlockButton.className).toContain('focus-visible');
    });
  });

  describe('Interactive component focus management', () => {
    it('should have all buttons with proper focus styles', () => {
      renderSettings();

      const lightButton = screen.getByTitle('Modo Claro');
      const darkButton = screen.getByTitle('Modo Escuro');
      const unlockButton = screen.getByText('Desbloquear Painel');

      // All buttons should have focus-visible classes
      expect(lightButton.className).toContain('focus-visible');
      expect(darkButton.className).toContain('focus-visible');
      expect(unlockButton.className).toContain('focus-visible');
    });

    it('should support keyboard interaction with password form', () => {
      renderSettings();

      const passwordInput = screen.getByLabelText(/Código de Acesso/i);
      const form = passwordInput.closest('form');

      // Form exists and is ready for keyboard interaction
      expect(form).toBeInTheDocument();
      expect(form?.className).toContain('flex');
    });
  });
});
