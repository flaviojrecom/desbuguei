import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 * @param key - The key to listen for (e.g., 'v', 'Enter', ' ')
 * @param callback - Function to call when shortcut is pressed
 * @param options - Options for modifier keys and event handling
 * @returns void
 *
 * @example
 * // Alt+V to activate voice assistant
 * useKeyboardShortcut('v', () => openVoiceAssistant(), { altKey: true })
 *
 * // Ctrl+K for search
 * useKeyboardShortcut('k', () => openSearch(), { ctrlKey: true })
 *
 * // Space to toggle
 * useKeyboardShortcut(' ', () => togglePlay(), { preventDefault: true })
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: KeyboardShortcutOptions = {}
): void {
  const {
    altKey = false,
    ctrlKey = false,
    shiftKey = false,
    metaKey = false,
    preventDefault = true,
    stopPropagation = false,
  } = options;

  // Memoize the handler to avoid recreating it unnecessarily
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if key is defined - prevent any undefined/null access
      if (!key || typeof key !== 'string') return;

      // Check if the pressed key matches (case-insensitive for letter keys)
      const keyMatches =
        key.toLowerCase() === event.key.toLowerCase() ||
        key === event.key;

      if (!keyMatches) return;

      // Check modifier keys
      if (event.altKey !== altKey) return;
      if (event.ctrlKey !== ctrlKey) return;
      if (event.shiftKey !== shiftKey) return;
      if (event.metaKey !== metaKey) return;

      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement | null;
      if (target && isInputElement(target) && !shouldTriggerInInput(key)) {
        return;
      }

      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      callback();
    },
    [key, callback, altKey, ctrlKey, shiftKey, metaKey, preventDefault, stopPropagation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Check if element is an input-like element
 * @param element - The element to check
 * @returns boolean
 */
function isInputElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const contentEditable = element.getAttribute('contenteditable');

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    contentEditable === 'true' ||
    contentEditable === 'plaintext-only'
  );
}

/**
 * Determine if shortcut should trigger when typing in input
 * Only Space, Enter, Tab should trigger in inputs (for accessibility)
 * @param key - The key pressed
 * @returns boolean
 */
function shouldTriggerInInput(key: string): boolean {
  return [' ', 'Enter', 'Tab'].includes(key);
}

/**
 * Common keyboard shortcuts configuration
 */
export const KEYBOARD_SHORTCUTS = {
  VOICE_ASSISTANT: { key: 'v', altKey: true },
  SEARCH: { key: 'k', ctrlKey: true },
  SEARCH_MAC: { key: 'k', metaKey: true },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  SPACE: { key: ' ' },
  HELP: { key: '?' },
  FOCUS_SEARCH: { key: '/', preventDefault: false },
} as const;
