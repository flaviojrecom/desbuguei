# Story TD-204: Keyboard Navigation & A11y Deep Audit

**Epic:** EPIC-TD-001 (Technical Debt Resolution - Phase 2)
**Status:** 📝 Draft
**Priority:** P0 - CRITICAL
**Sprint:** Phase 2, Week 2
**Effort:** 6 hours
**Created:** 2026-02-02

---

## 📖 User Story

As a **UX designer**, I want to **audit and fix keyboard navigation** so that **all interactive elements are accessible via keyboard**.

---

## ✅ Acceptance Criteria

### Keyboard Navigation Testing
- [ ] Tab key cycles through interactive elements in logical order
- [ ] Shift+Tab navigates backwards through elements
- [ ] Focus indicator visible (≥ 3px, ≥ 3:1 contrast ratio)
- [ ] Focus order follows visual flow (top-to-bottom, left-to-right)
- [ ] No keyboard traps (users can always escape with Tab/Shift+Tab)

### Modal/Dialog Keyboard Behavior
- [ ] Escape key closes modal/dialog
- [ ] Focus trapped within modal (Tab doesn't leave modal)
- [ ] Focus returned to trigger element on close
- [ ] All interactive elements inside modal are keyboard accessible

### VoiceAssistant Keyboard Support
- [ ] Keyboard shortcut to activate (recommend Alt+V)
- [ ] Keyboard shortcut documented in Help/Settings
- [ ] Voice control works without mouse/touchpad
- [ ] Microphone permission flow accessible via keyboard

### Form Keyboard Support
- [ ] Form fields labeled and properly associated with `<label>` elements
- [ ] Required field indicators accessible to keyboard users
- [ ] Error messages linked to fields via `aria-describedby`
- [ ] Form submission works via keyboard (Enter key)
- [ ] Form reset works via keyboard

### Interactive Component Audit
- [ ] Buttons have visible :focus styles (≥ 3px outline)
- [ ] Links have visible :focus styles (underline or outline)
- [ ] Dropdown menus navigable via Arrow keys
- [ ] Checkboxes/radio buttons navigable via keyboard and Space to toggle
- [ ] Sliders/range inputs navigable via Arrow keys
- [ ] Search input responds to Enter key

### Documentation & Help
- [ ] Keyboard shortcuts documented in Help section/modal
- [ ] Developer guide for keyboard support added to docs/guides/
- [ ] Accessibility guide updated with keyboard navigation rules

---

## 🎯 Definition of Done

- [ ] All interactive elements are keyboard accessible (100% coverage)
- [ ] Focus management verified on all pages
- [ ] Modals trap focus correctly and restore on close
- [ ] Keyboard shortcuts documented and user-facing
- [ ] Accessibility audit score > 90 for keyboard support (axe DevTools)
- [ ] Unit tests added for focus management
- [ ] Manual keyboard navigation testing completed and documented
- [ ] WCAG 2.1 Level AA keyboard compliance achieved
- [ ] Code merged to main branch
- [ ] Story marked "Ready for Review"

---

## 📋 Tasks

### Task 1: Audit Current Keyboard Navigation
**Subtasks:**
- [x] 1.1 Test Tab/Shift+Tab navigation on Dashboard page
- [x] 1.2 Test Tab/Shift+Tab navigation on Glossary page
- [x] 1.3 Test Tab/Shift+Tab navigation on Term Detail page
- [x] 1.4 Test Tab/Shift+Tab navigation on Search/History pages
- [x] 1.5 Test Tab/Shift+Tab navigation on Settings page
- [x] 1.6 Document focus order issues found (use axe DevTools Chrome extension)
- [x] 1.7 Create audit report with screenshots of missing focus indicators

### Task 2: Fix Focus Indicators
**Subtasks:**
- [x] 2.1 Add CSS `:focus` styles to all buttons (outline: 3px solid #3B82F6)
- [x] 2.2 Add CSS `:focus` styles to all links (outline: 3px solid #3B82F6)
- [x] 2.3 Add CSS `:focus` styles to form inputs
- [x] 2.4 Add CSS `:focus-visible` for better UX (only show on keyboard)
- [x] 2.5 Verify focus indicator contrast ratio ≥ 3:1
- [x] 2.6 Test focus visibility in both light and dark themes

### Task 3: Implement Keyboard Navigation for Interactive Components
**Subtasks:**
- [x] 3.1 Implement VoiceAssistant Alt+V keyboard shortcut (use `useKeyboardShortcut` hook)
- [x] 3.2 Test VoiceAssistant keyboard activation and full workflow
- [ ] 3.3 Implement Arrow key navigation for dropdown menus
- [ ] 3.4 Implement Space key toggle for checkboxes/radio buttons
- [ ] 3.5 Implement Enter key for form submission
- [ ] 3.6 Test all interactive components with keyboard only

### Task 4: Fix Modal/Dialog Focus Management
**Subtasks:**
- [ ] 4.1 Ensure Escape key closes all modals
- [ ] 4.2 Implement focus trap (use `react-focus-lock` or similar)
- [ ] 4.3 Restore focus to trigger element on modal close
- [ ] 4.4 Test focus trap on Settings modal
- [ ] 4.5 Test focus trap on any confirmation dialogs
- [ ] 4.6 Verify focus trap works in all browsers (Chrome, Safari, Firefox)

### Task 5: Fix Form Accessibility
**Subtasks:**
- [ ] 5.1 Audit all forms for proper label associations
- [ ] 5.2 Link error messages to form fields via `aria-describedby`
- [ ] 5.3 Add `aria-required="true"` to required fields
- [ ] 5.4 Test form submission via keyboard (Enter key)
- [ ] 5.5 Test form with screen reader (NVDA or JAWS)
- [ ] 5.6 Verify form fields have proper tab order

### Task 6: Create Keyboard Shortcuts Documentation
**Subtasks:**
- [ ] 6.1 Document all keyboard shortcuts in Help section
- [ ] 6.2 Create developer guide: `docs/guides/keyboard-accessibility.md`
- [ ] 6.3 Include code examples for implementing keyboard support
- [ ] 6.4 Document WCAG 2.1 Level AA keyboard criteria
- [ ] 6.5 Create checklist for future keyboard accessibility reviews

### Task 7: Add Unit Tests for Focus Management
**Subtasks:**
- [ ] 7.1 Write test for VoiceAssistant Alt+V activation
- [ ] 7.2 Write test for focus trap in modals
- [ ] 7.3 Write test for focus restoration on modal close
- [ ] 7.4 Write test for keyboard form submission
- [ ] 7.5 Run all tests and verify passing
- [ ] 7.6 Add tests to pre-commit hook

### Task 8: Final Accessibility Audit
**Subtasks:**
- [ ] 8.1 Run axe DevTools audit on all pages
- [ ] 8.2 Run WAVE audit for additional issues
- [ ] 8.3 Test with NVDA screen reader (Windows) or VoiceOver (Mac)
- [ ] 8.4 Manual keyboard navigation test on all pages
- [ ] 8.5 Verify accessibility score > 90
- [ ] 8.6 Document audit results and any remaining issues

---

## 🔧 Technical Details

### Standards & Tools
- **WCAG Standard:** WCAG 2.1 Level AA (keyboard support)
- **Testing Tools:** axe DevTools, WAVE, NVDA/VoiceOver
- **CSS Focus Styles:** 3px solid outline with ≥ 3:1 contrast
- **Focus Indicator Color:** Primary brand color (#3B82F6) for visibility

### Key Components to Update
- `src/components/Card.tsx` - Add focus styles
- `src/components/Layout.tsx` - Fix navigation focus order
- `src/components/VoiceAssistant.tsx` - Add Alt+V shortcut, keyboard controls
- `src/pages/Dashboard.tsx` - Test tab order, focus management
- `src/pages/Glossary.tsx` - Test tab order
- `src/pages/Settings.tsx` - Test form keyboard support, modal focus trap
- `src/context/` - May need focus management utilities
- `src/styles/` or Tailwind config - Add :focus/:focus-visible styles

### Dependencies
- React hooks (useEffect, useRef) for focus management
- Optional: `react-focus-lock` for modal focus trapping (lightweight, ~1.5KB)
- Optional: `keyboard-key` library for detecting keyboard events

### Design Tokens to Use
- **Focus Color:** `--color-primary` (#3B82F6)
- **Focus Width:** 3px (or `--border-radius-lg` from design tokens)
- **Focus Contrast:** ≥ 3:1 with background

---

## 📚 Dependencies

### Must Complete Before
- TD-103 (Basic a11y fixes) - ✅ Already done

### Enables
- TD-205 (Unit Tests - Context Hooks) - Will inherit keyboard testing patterns
- TD-206 (Rate Limiting Implementation) - Will use accessible form patterns

### References
- Design Tokens: `docs/design-system/TOKENS.md` (use `--color-primary` for focus)
- Architecture: `docs/architecture/ARCHITECTURE.md`
- Previous A11y Work: `docs/stories/TD-103-accessibility.md`

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Tab through every page - no keyboard traps
- [ ] Shift+Tab backwards - works correctly
- [ ] Focus indicator visible - 3px outline with good contrast
- [ ] Modals trap focus - Tab stays within modal
- [ ] Escape closes modals - Focus returns to trigger
- [ ] Alt+V activates VoiceAssistant - Works without mouse
- [ ] Forms submittable via keyboard - Enter key works
- [ ] Screen reader compatible - NVDA/VoiceOver reads correctly

### Automated Testing
- [ ] axe-core checks pass (keyboard criteria)
- [ ] Unit tests for focus management pass
- [ ] Focus restoration tests pass
- [ ] Modal focus trap tests pass

### Tools
- **axe DevTools** (Chrome extension) - Run audit
- **WAVE** (WebAIM) - Secondary audit
- **NVDA** (Windows) or **VoiceOver** (Mac) - Screen reader testing
- **Keyboard-only testing** - Unplug mouse and test entire app

---

## 💡 Dev Notes

### Key Implementation Patterns

**1. Focus Styles (CSS)**
```css
/* In your stylesheet or Tailwind config */
button:focus,
a:focus,
input:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Better UX - only show on keyboard, not mouse */
button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

**2. Keyboard Shortcut (React Hook)**
```typescript
// Hook to use globally
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === key && e.altKey) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback]);
}

// Usage in VoiceAssistant
useKeyboardShortcut('v', () => startListening());
```

**3. Modal Focus Trap (react-focus-lock)**
```typescript
import FocusLock from 'react-focus-lock';

export function Modal() {
  return (
    <FocusLock>
      <div role="dialog">
        {/* Modal content - focus trapped here */}
      </div>
    </FocusLock>
  );
}
```

**4. Focus Restoration**
```typescript
const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);

function openModal(e: React.MouseEvent) {
  setTriggerRef(e.currentTarget as HTMLElement);
  setIsOpen(true);
}

function closeModal() {
  setIsOpen(false);
  triggerRef?.focus(); // Restore focus
}
```

---

## 🚀 Quality Gates

### Pre-Commit
- [ ] CSS focus styles follow design tokens
- [ ] No console errors in browser
- [ ] Keyboard navigation manual test passed

### Pre-PR
- [ ] axe DevTools audit score > 90
- [ ] All unit tests passing
- [ ] Manual keyboard testing report attached
- [ ] Focus management tests passing

### Pre-Deploy
- [ ] WCAG 2.1 Level AA keyboard compliance verified
- [ ] No regression in existing functionality
- [ ] Documentation updated

---

## 📊 File List

### Files Created (Tasks 1-3)
- `docs/KEYBOARD-AUDIT-REPORT.md` - Comprehensive keyboard navigation audit (Task 1)
- `src/index.css` - Global focus styles (Task 2) ✓
- `src/tests/focus-indicators.test.tsx` - 8 tests for focus styles (Task 2) ✓
- `src/hooks/useKeyboardShortcut.ts` - Reusable keyboard shortcut hook (Task 3) ✓
- `src/tests/useKeyboardShortcut.test.ts` - 14 tests for keyboard hook (Task 3) ✓
- `components/KeyboardShortcutsManager.tsx` - Global keyboard shortcut manager (Task 3) ✓
- `components/__tests__/KeyboardShortcutsManager.test.tsx` - 5 tests for manager (Task 3) ✓

### Files Modified (Tasks 1-3)
- `index.tsx` - Added CSS import for global focus styles (Task 2) ✓
- `components/Layout.tsx` - Added :focus-visible styles to SidebarItem (Task 2) ✓
- `components/Card.tsx` - Simplified to use global focus styles (Task 2) ✓
- `App.tsx` - Added KeyboardShortcutsManager wrapper (Task 3) ✓

### Files Pending (Tasks 4-8)
- `components/VoiceAssistant.tsx` - Escape key modal closing (Task 4)
- `pages/Settings.tsx` - Form keyboard support and modal focus trap (Task 5)
- `docs/guides/keyboard-accessibility.md` - Developer guide (Task 6)
- Various test files - Focus trap and form tests (Task 7)

### Files to Delete
- None

---

## 📝 Change Log

### Version 1.0 (Draft)
- Story created from STORIES-TECHNICAL-DEBT.md
- All acceptance criteria defined
- Tasks broken down into 8 actionable steps
- Technical implementation patterns provided

---

## 🔗 References

- **WCAG 2.1 Level AA Keyboard:** https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
- **Focus Visible:** https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible
- **Accessible Names:** https://www.w3.org/TR/accname-1.1/
- **Modal Focus Management:** https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **Design System:** `docs/design-system/TOKENS.md`

---

## 👤 Agent Model Used

**Assigned To:** @dev (Dex)
**Specialized Agents Needed:**
- @dev (Dex) - Implementation
- @qa (Quinn) - Testing & validation (optional)
- @ux-design-expert (Uma) - A11y best practices guidance (optional)

---

## 🧪 Completion Notes

_To be filled by developer after completion_

---

## 📝 Dev Agent Record

### Current Task
Task 3: Implement Keyboard Navigation for Interactive Components (Subtasks 3.1-3.2 COMPLETE)

### Debug Log

**Task 1: Audit Current Keyboard Navigation** ✅ COMPLETE
- Audited all 5 pages (Dashboard, Glossary, Term Detail, History, Settings)
- Created comprehensive audit report: docs/KEYBOARD-AUDIT-REPORT.md
- Identified HIGH, MEDIUM, LOW priority fixes needed
- Key findings: 40% keyboard support currently

**Task 2: Fix Focus Indicators** ✅ COMPLETE
- Added global :focus-visible styles to src/index.css (80 lines)
- Updated components/Layout.tsx to use :focus-visible on SidebarItem
- Simplified components/Card.tsx to use global focus styles
- Added CSS import to index.tsx
- Created 8 comprehensive tests in src/tests/focus-indicators.test.tsx
- All tests passing (8 tests)
- WCAG 2.1 AA compliance: 3px outline with ≥3:1 contrast ratio

**Task 3: Implement Keyboard Navigation** ✅ SUBTASKS 3.1-3.2 COMPLETE
- Created src/hooks/useKeyboardShortcut.ts (112 lines)
  - Exports useKeyboardShortcut hook with TypeScript types
  - Supports modifier keys: altKey, ctrlKey, shiftKey, metaKey
  - Includes KEYBOARD_SHORTCUTS configuration object
  - Features null checking and input element detection
- Created src/tests/useKeyboardShortcut.test.ts (14 tests)
  - Hook registration/cleanup tests
  - Keyboard shortcut configuration tests
  - Hook options tests (altKey, ctrlKey, metaKey, preventDefault)
  - Common use cases (voice assistant, search, modals)
  - WCAG 2.1 AA accessibility compliance tests
- Created components/KeyboardShortcutsManager.tsx (global keyboard listener)
  - Integrates with VoiceProvider context
  - Listens for Alt+V to open voice assistant
- Created components/__tests__/KeyboardShortcutsManager.test.tsx (5 tests)
- All tests passing (68 total tests across 6 files)

**Task 3 Subtasks Status:**
- [x] 3.1 Implement VoiceAssistant Alt+V keyboard shortcut ✓
  - Hook created and integrated globally
  - KeyboardShortcutsManager calls openVoice() on Alt+V
- [x] 3.2 Test VoiceAssistant keyboard activation ✓
  - 5 tests verify KeyboardShortcutsManager functionality
  - Tests verify Alt+V configuration and accessibility
- [ ] 3.3 Arrow key navigation for dropdown menus (pending)
- [ ] 3.4 Space key for checkboxes/radio buttons (pending)
- [ ] 3.5 Enter key for form submission (pending)
- [ ] 3.6 Test all interactive components (pending)

### Completion Summary
Tasks 1-2 complete. Task 3 subtasks 3.1-3.2 complete.
Alt+V keyboard shortcut fully implemented and tested (68 tests passing).
Ready to implement Task 3 remaining subtasks (3.3-3.6) and Task 4 (modal focus trap).

---

**Created by:** River (Scrum Master)
**Date:** 2026-02-02
**Last Updated:** 2026-02-02
