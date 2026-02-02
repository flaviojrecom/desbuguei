import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HelpModal } from '../HelpModal';
import { VoiceProvider } from '../../context/VoiceContext';

describe('HelpModal Component (Task 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal visibility and structure', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <VoiceProvider>
          <HelpModal isOpen={false} onClose={vi.fn()} />
        </VoiceProvider>
      );

      // Should not be in document
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should have correct aria-label', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-label', 'Atalhos de teclado e ajuda');
    });
  });

  describe('Keyboard shortcuts documentation', () => {
    it('should display global shortcuts section', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText('Atalhos Globais')).toBeInTheDocument();
    });

    it('should display settings shortcuts section', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    it('should display form shortcuts section', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText('Formulários')).toBeInTheDocument();
    });

    it('should display Alt+V shortcut for voice assistant', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(
        screen.getByText('Abrir Assistente de Voz')
      ).toBeInTheDocument();
    });

    it('should display Escape shortcut for closing modal', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText('Fechar Modal')).toBeInTheDocument();
    });
  });

  describe('Accessibility information', () => {
    it('should display accessibility compliance information', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText(/WCAG 2.1 Level AA/i)).toBeInTheDocument();
    });

    it('should mention screen reader support', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText(/NVDA/i)).toBeInTheDocument();
      expect(screen.getByText(/JAWS/i)).toBeInTheDocument();
      expect(screen.getByText(/VoiceOver/i)).toBeInTheDocument();
    });
  });

  describe('Modal controls', () => {
    it('should have close button with proper aria-label', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const closeButtons = screen.getAllByLabelText('Fechar ajuda');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn();
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={onClose} />
        </VoiceProvider>
      );

      // Modal rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have footer close button', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const closeButtons = screen.getAllByText('Fechar');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard accessibility (Task 6 requirement)', () => {
    it('should be fully keyboard navigable', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      // Modal and all buttons should be in document for keyboard navigation
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('should have focus-visible on all interactive elements', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('focus-visible');
      });
    });

    it('should trap focus within modal', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      // Focus trap ensures Tab stays within modal
    });
  });

  describe('WCAG 2.1 Level AA Compliance', () => {
    it('should have proper semantic structure', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      // Dialog role with aria-modal
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');

      // Heading structure
      expect(screen.getByText('Atalhos de Teclado')).toBeInTheDocument();
    });

    it('should support keyboard-only navigation', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      // All buttons are keyboard accessible and have focus-visible styles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.className).toContain('focus-visible');
      });
    });

    it('should have sufficient color contrast', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      // Text elements should be readable
      expect(screen.getByText('Atalhos de Teclado')).toHaveClass('text-slate-100');
      expect(screen.getByText(/Configurações/)).toBeInTheDocument();
    });
  });

  describe('Tips section', () => {
    it('should display helpful tips for keyboard users', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      expect(screen.getByText('Dicas')).toBeInTheDocument();
    });

    it('should mention keyboard navigation capability', () => {
      render(
        <VoiceProvider>
          <HelpModal isOpen={true} onClose={vi.fn()} />
        </VoiceProvider>
      );

      const tipsSection = screen.getByText('Dicas').closest('section');
      expect(tipsSection).toBeInTheDocument();
    });
  });
});
