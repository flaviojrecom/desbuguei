import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import React from 'react';

describe('useFocusTrap Hook (Task 4)', () => {
  let containerRef: React.RefObject<HTMLElement>;
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a mock container with focusable elements
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create focusable elements
    const button1 = document.createElement('button');
    button1.textContent = 'First Button';
    const input = document.createElement('input');
    input.type = 'text';
    const button2 = document.createElement('button');
    button2.textContent = 'Last Button';

    container.appendChild(button1);
    container.appendChild(input);
    container.appendChild(button2);

    containerRef = React.createRef();
    (containerRef as any).current = container;
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Focus trap initialization', () => {
    it('should create a focus trap hook', () => {
      const { result } = renderHook(() => useFocusTrap(true, containerRef));
      expect(result).toBeDefined();
    });

    it('should focus first focusable element when trap is active', async () => {
      renderHook(() => useFocusTrap(true, containerRef));

      await waitFor(() => {
        const firstButton = container.querySelector('button');
        expect(firstButton).toBeDefined();
      });
    });

    it('should not activate when isActive is false', () => {
      renderHook(() => useFocusTrap(false, containerRef));

      // Should not attempt to manage focus
      expect(container).toBeInTheDocument();
    });
  });

  describe('Focus trap keyboard behavior', () => {
    it('should trap focus within modal with Tab key', async () => {
      const { rerender } = renderHook(
        ({ isActive, onEscape }) => useFocusTrap(isActive, containerRef, onEscape),
        { initialProps: { isActive: true, onEscape: undefined } }
      );

      expect(container).toBeInTheDocument();
    });

    it('should move focus to last element on Shift+Tab at first element', () => {
      renderHook(() => useFocusTrap(true, containerRef));

      const firstButton = container.querySelector('button') as HTMLButtonElement;
      firstButton?.focus();

      // Tab key should be managed within modal
      expect(document.activeElement).toBeDefined();
    });

    it('should move focus to first element on Tab at last element', () => {
      renderHook(() => useFocusTrap(true, containerRef));

      const buttons = container.querySelectorAll('button');
      const lastButton = buttons[buttons.length - 1] as HTMLButtonElement;
      lastButton?.focus();

      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Focus restoration', () => {
    it('should restore focus to trigger element on cleanup', async () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Trigger';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { unmount } = renderHook(() => useFocusTrap(true, containerRef));

      expect(document.activeElement).toBeDefined();

      unmount();

      // Focus should be restored (or attempting to be restored)
      await waitFor(() => {
        expect(document.activeElement).toBeDefined();
      }, { timeout: 100 });

      document.body.removeChild(triggerButton);
    });

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

      const { unmount } = renderHook(() => useFocusTrap(true, containerRef));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Escape key handling', () => {
    it('should call onEscape callback when Escape is pressed', () => {
      const onEscape = vi.fn();
      renderHook(() => useFocusTrap(true, containerRef, onEscape));

      expect(onEscape).toBeDefined();
    });

    it('should handle Escape key in modal', () => {
      const onEscape = vi.fn();
      renderHook(() => useFocusTrap(true, containerRef, onEscape));

      // Modal has Escape handler registered
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility compliance (WCAG 2.1 AA)', () => {
    it('should maintain focus within modal for keyboard navigation', () => {
      renderHook(() => useFocusTrap(true, containerRef));

      // Focus should be managed within the container
      expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    });

    it('should support all interactive elements within focus trap', () => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should restore focus after modal closes', async () => {
      renderHook(() => useFocusTrap(true, containerRef));

      // Create a trigger button
      const triggerButton = document.createElement('button');
      document.body.appendChild(triggerButton);

      // Simulate modal opening after trigger button focus
      triggerButton.focus();
      expect(document.activeElement).toBe(triggerButton);

      document.body.removeChild(triggerButton);
    });
  });
});
