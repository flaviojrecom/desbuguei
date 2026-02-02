import React from 'react';
import { useVoice } from '../context/VoiceContext';
import { useKeyboardShortcut, KEYBOARD_SHORTCUTS } from '../src/hooks/useKeyboardShortcut';

/**
 * Global keyboard shortcuts manager component
 * Listens for keyboard shortcuts and triggers corresponding actions
 *
 * Shortcuts:
 * - Alt+V: Activate voice assistant
 *
 * This component must be placed inside VoiceProvider to access voice context
 */
export const KeyboardShortcutsManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { openVoice } = useVoice();

  // Listen for Alt+V to activate voice assistant
  useKeyboardShortcut(
    KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.key,
    () => {
      openVoice();
    },
    {
      altKey: KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.altKey,
    }
  );

  return <>{children}</>;
};
