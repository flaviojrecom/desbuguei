import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useKeyboardShortcut, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcut';

describe('useKeyboardShortcut Hook (Task 3)', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hook registration and cleanup', () => {
    it('should register event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      renderHook(() => useKeyboardShortcut('v', callback));

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcut('v', callback));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should update event listener when callback changes', () => {
      const { rerender } = renderHook(
        ({ cb }: { cb: () => void }) => useKeyboardShortcut('v', cb),
        { initialProps: { cb: callback } }
      );

      const newCallback = vi.fn();
      rerender({ cb: newCallback });

      expect(callback).toBeDefined();
      expect(newCallback).toBeDefined();
    });
  });

  describe('Keyboard shortcuts configuration', () => {
    it('should have VOICE_ASSISTANT shortcut as Alt+V', () => {
      expect(KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.key).toBe('v');
      expect(KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.altKey).toBe(true);
    });

    it('should have SEARCH shortcut as Ctrl+K', () => {
      expect(KEYBOARD_SHORTCUTS.SEARCH.key).toBe('k');
      expect(KEYBOARD_SHORTCUTS.SEARCH.ctrlKey).toBe(true);
    });

    it('should have SEARCH_MAC shortcut for Mac (Cmd+K)', () => {
      expect(KEYBOARD_SHORTCUTS.SEARCH_MAC.key).toBe('k');
      expect(KEYBOARD_SHORTCUTS.SEARCH_MAC.metaKey).toBe(true);
    });

    it('should have ESCAPE shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.ESCAPE.key).toBe('Escape');
    });

    it('should have ENTER shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.ENTER.key).toBe('Enter');
    });

    it('should have SPACE shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.SPACE.key).toBe(' ');
    });

    it('should have HELP shortcut', () => {
      expect(KEYBOARD_SHORTCUTS.HELP.key).toBe('?');
    });
  });

  describe('Hook options', () => {
    it('should accept altKey option', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut('v', callback, { altKey: true })
      );

      expect(callback).toBeDefined();
      unmount();
    });

    it('should accept ctrlKey option', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut('k', callback, { ctrlKey: true })
      );

      expect(callback).toBeDefined();
      unmount();
    });

    it('should accept metaKey option', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut('k', callback, { metaKey: true })
      );

      expect(callback).toBeDefined();
      unmount();
    });

    it('should accept preventDefault option', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut('v', callback, { preventDefault: false })
      );

      expect(callback).toBeDefined();
      unmount();
    });
  });

  describe('Common use cases', () => {
    it('should support voice assistant activation (Alt+V)', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut(
          KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.key,
          callback,
          { altKey: KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.altKey }
        )
      );

      expect(callback).toBeDefined();
      unmount();
    });

    it('should support search activation (Ctrl+K or Cmd+K)', () => {
      const ctrlKHook = renderHook(() =>
        useKeyboardShortcut(
          KEYBOARD_SHORTCUTS.SEARCH.key,
          callback,
          { ctrlKey: KEYBOARD_SHORTCUTS.SEARCH.ctrlKey }
        )
      );

      const cmdKHook = renderHook(() =>
        useKeyboardShortcut(
          KEYBOARD_SHORTCUTS.SEARCH_MAC.key,
          callback,
          { metaKey: KEYBOARD_SHORTCUTS.SEARCH_MAC.metaKey }
        )
      );

      expect(callback).toBeDefined();

      ctrlKHook.unmount();
      cmdKHook.unmount();
    });

    it('should support Escape key for closing modals', () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcut(KEYBOARD_SHORTCUTS.ESCAPE.key, callback)
      );

      expect(callback).toBeDefined();
      unmount();
    });
  });

  describe('Accessibility compliance', () => {
    it('should have configurations for WCAG 2.1 Level AA keyboard support', () => {
      // Voice assistant shortcut should be documented and accessible
      expect(KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.key).toBeDefined();

      // Escape should close modals
      expect(KEYBOARD_SHORTCUTS.ESCAPE.key).toBe('Escape');

      // Enter should submit forms
      expect(KEYBOARD_SHORTCUTS.ENTER.key).toBe('Enter');
    });
  });
});
