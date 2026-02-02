import { useEffect, useRef } from 'react';

/**
 * Custom hook for implementing focus trap in modals/dialogs
 * Keeps focus within the modal and restores it when the modal closes
 *
 * @param isActive - Whether the focus trap should be active
 * @param containerRef - Ref to the modal container element
 * @param onEscape - Optional callback for Escape key handling
 * @returns void
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(isOpen, modalRef);
 */
export function useFocusTrap(
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement>,
  onEscape?: () => void
): void {
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the element that had focus before the modal opened
    triggerElementRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements within the modal
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first focusable element when modal opens
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key to keep focus within modal
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab on first element: move to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab on last element: move to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Handle Escape key if callback provided
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup: remove event listener and restore focus
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the element that had focus before the modal opened
      if (triggerElementRef.current) {
        // Use setTimeout to ensure focus happens after modal DOM cleanup
        setTimeout(() => {
          triggerElementRef.current?.focus();
        }, 0);
      }
    };
  }, [isActive, containerRef, onEscape]);
}
