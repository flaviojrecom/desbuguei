# Keyboard Accessibility Guide

**Document Version:** 1.0
**Last Updated:** 2026-02-02
**WCAG Compliance:** WCAG 2.1 Level AA

---

## Table of Contents

1. [User Keyboard Shortcuts](#user-keyboard-shortcuts)
2. [Implementation Patterns](#implementation-patterns)
3. [WCAG 2.1 Level AA Keyboard Criteria](#wcag-21-level-aa-keyboard-criteria)
4. [Testing Guidelines](#testing-guidelines)
5. [Accessibility Checklist](#accessibility-checklist)

---

## User Keyboard Shortcuts

### Global Shortcuts

These shortcuts work anywhere in the application:

| Shortcut | Action | Use Case |
|----------|--------|----------|
| **Alt+V** | Open Voice Assistant | Quickly activate voice-based term search |
| **Alt+K** | Focus Search (Windows/Linux) | Navigate to search on Glossary page |
| **Cmd+K** | Focus Search (Mac) | Same as above on macOS |
| **Escape** | Close Modal/Dialog | Close any open voice assistant or modal |
| **Tab** | Navigate Forward | Move to next focusable element |
| **Shift+Tab** | Navigate Backward | Move to previous focusable element |
| **Space** | Select/Toggle | Select character in settings, toggle checkboxes |
| **Enter** | Submit Form | Submit password or seed database forms |

### Page-Specific Shortcuts

#### Voice Assistant Modal
- **Arrow Left/Right** - Navigate between character mentors (when visible)
- **Arrow Up/Down** - Alternative character navigation (grid-based)
- **Space** - Select current character
- **Escape** - Close voice assistant (focus restored to trigger button)
- **Tab** - Navigate within modal (trapped, doesn't leave modal)

#### Settings Page
- **Arrow Left/Right** - Cycle through theme modes (Light/Dark)
- **Space** - Select theme or character
- **Enter** - Submit admin unlock form or seed database
- **Tab** - Navigate through all settings controls

---

## Implementation Patterns

### 1. Global Keyboard Shortcuts

**File:** `src/hooks/useKeyboardShortcut.ts`

Use the `useKeyboardShortcut` hook to add keyboard shortcuts to any component:

```typescript
import { useKeyboardShortcut, KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcut';

export function MyComponent() {
  const handleVoiceActivation = () => {
    // Open voice assistant or perform action
  };

  // Alt+V activates voice assistant
  useKeyboardShortcut(
    KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.key,
    handleVoiceActivation,
    { altKey: KEYBOARD_SHORTCUTS.VOICE_ASSISTANT.altKey }
  );

  return <div>Your component</div>;
}
```

**Available Shortcuts (from KEYBOARD_SHORTCUTS object):**
- `VOICE_ASSISTANT` - Alt+V
- `SEARCH` - Ctrl+K (Windows/Linux)
- `SEARCH_MAC` - Cmd+K (macOS)
- `ESCAPE` - Escape key
- `ENTER` - Enter key
- `SPACE` - Space key
- `HELP` - ? key
- `FOCUS_SEARCH` - / key

### 2. Focus Management

**File:** `src/hooks/useFocusTrap.ts`

Implement focus trap for modals to keep keyboard focus within the modal:

```typescript
import { useFocusTrap } from '../hooks/useFocusTrap';

export function MyModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap: Tab/Shift+Tab stays within modal
  useFocusTrap(isOpen, modalRef, onClose);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

### 3. Form Accessibility

**Best Practices:**

```typescript
// ✓ Correct - Proper label association
<label htmlFor="email-input">Email Address</label>
<input
  id="email-input"
  type="email"
  aria-required="true"
  aria-describedby="email-help"
/>
<p id="email-help">We'll never share your email.</p>

// ✗ Avoid - No label association
<input type="email" placeholder="Email" />
```

### 4. Focus Indicators

**File:** `src/index.css`

All interactive elements should have visible focus indicators:

```css
/* Global focus styles */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Button focus */
button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Link focus */
a:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Form input focus */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 5. Keyboard Navigation Structure

**Recommended Tab Order:**

```typescript
// Components should follow visual flow
<header>
  <button>Menu</button>           {/* Tab 1 */}
  <nav>
    <a href="/home">Home</a>      {/* Tab 2 */}
    <a href="/about">About</a>    {/* Tab 3 */}
  </nav>
  <button>Settings</button>       {/* Tab 4 */}
</header>
<main>
  <input type="text" />           {/* Tab 5 */}
  <button>Submit</button>         {/* Tab 6 */}
</main>
```

---

## WCAG 2.1 Level AA Keyboard Criteria

### Keyboard Accessibility (2.1.1 - Level A)

**Requirement:** All functionality available via keyboard

**Implementation:**
- ✓ Use semantic HTML: `<button>`, `<a>`, `<form>`, `<label>`
- ✓ Use `tabindex="0"` only for custom components
- ✓ Never use `tabindex="-1"` except for programmatic focus management
- ✓ Avoid `tabindex > 0` (breaks logical tab order)

**Testing:**
```
Tab through entire page - all interactive elements should be reachable
Shift+Tab backwards - all elements reachable in reverse
Mouse disabled - all functions work via keyboard
```

### Focus Visible (2.4.7 - Level AA)

**Requirement:** Keyboard focus indicator must be visible

**Specifications:**
- Minimum size: 3px solid outline (or equivalent visual indicator)
- Minimum contrast: 3:1 ratio with background
- Must not be completely hidden (no `outline: none` without replacement)

**Implementation:**
```css
/* Good - visible indicator */
button:focus-visible {
  outline: 3px solid #3B82F6;
}

/* Bad - no indicator */
button:focus-visible {
  outline: none;  /* ✗ Missing focus indicator */
}
```

### Focus Order (2.4.3 - Level A)

**Requirement:** Tab order follows logical visual flow

**Rules:**
- Avoid positive `tabindex` values (except 0)
- Order follows top-to-bottom, left-to-right
- If custom tab order needed, use JS focus management
- Skip hidden/disabled elements automatically

### No Keyboard Trap (2.1.2 - Level A)

**Requirement:** Keyboard focus must not be trapped

**Implementation:**
```typescript
// Bad - focus trap without escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    // Force focus to stay in modal - but no way to exit!
    e.preventDefault();
  }
});

// Good - focus trap with escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();  // Escape key provides exit
  }
});
```

### Character Key Shortcuts (2.4.3 - Level A)

**Requirement:** Single-character shortcuts shouldn't conflict with native functionality

**Best Practice:**
- Use modifier keys (Alt+V, Cmd+K) for custom shortcuts
- Don't use single character shortcuts that conflict with browser (Ctrl+S, Ctrl+F, etc)
- Document all shortcuts in Help section

---

## Testing Guidelines

### Manual Keyboard Testing Checklist

```
□ Tab through entire page
□ Shift+Tab navigates backwards
□ Focus indicator visible on all interactive elements
□ Focus order follows visual flow (top→bottom, left→right)
□ No keyboard traps (can always tab forward/backward)
□ Escape closes any open modals
□ Enter submits forms
□ Custom shortcuts work with correct modifiers
□ All interactive elements keyboard accessible
```

### Automated Testing

**Tools:**
- **axe DevTools** - Chrome extension for accessibility audit
- **WAVE** - WebAIM accessibility checker
- **Vitest** - Unit tests (as used in this project)

**Example Test:**
```typescript
describe('Keyboard Navigation', () => {
  it('should support Tab navigation', async () => {
    const { getByText } = render(<App />);
    const button = getByText('Submit');

    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('should show focus indicator', () => {
    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
    // CSS will show focus-visible outline
  });
});
```

### Screen Reader Testing

**Tools:**
- **NVDA** (Windows) - Free, open-source
- **JAWS** (Windows) - Commercial, industry standard
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

**Test Points:**
- Form labels announced correctly
- Error messages announced with `role="alert"`
- Button purposes clear from label
- Navigation structure logical
- Page landmarks identified (`<main>`, `<nav>`, `<header>`, `<footer>`)

---

## Accessibility Checklist

### For New Features

When adding new interactive elements, verify:

- [ ] **Keyboard accessible** - All functions work via keyboard
- [ ] **Focus visible** - 3px outline or equivalent indicator
- [ ] **Proper semantics** - Using `<button>`, `<a>`, `<label>` correctly
- [ ] **Label associations** - Form fields have `<label>` with `htmlFor`
- [ ] **Tab order logical** - Follows visual flow
- [ ] **No keyboard trap** - Focus can move through all elements
- [ ] **Escape to close** - Modals close with Escape key
- [ ] **Focus restored** - Modal closing restores focus to trigger
- [ ] **ARIA attributes** - Using `aria-required`, `aria-describedby`, etc.
- [ ] **Error messaging** - Error messages linked with `aria-describedby`
- [ ] **Tests written** - Unit tests covering keyboard scenarios

### For Code Reviews

When reviewing keyboard accessibility:

- [ ] All shortcuts documented in Help section
- [ ] No `outline: none` without replacement focus indicator
- [ ] No positive `tabindex` values (only 0)
- [ ] Focus trap only in modals, with Escape exit
- [ ] Focus restored on modal close
- [ ] Screen reader considerations addressed
- [ ] Tests verify keyboard functionality
- [ ] No keyboard traps introduced

---

## Common Issues & Solutions

### Issue: Focus indicator not visible

**Problem:** User presses Tab, but can't see which element is focused

**Solutions:**
```css
/* Add visible focus-visible styles */
:focus-visible {
  outline: 3px solid #3B82F6;
  outline-offset: 2px;
}

/* Or use custom styles */
:focus-visible {
  background-color: #3B82F6;
  color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
```

### Issue: Can't exit modal with keyboard

**Problem:** Pressing Tab is trapped in modal, Escape doesn't close

**Solution:**
```typescript
useFocusTrap(isOpen, modalRef, closeModal);
// closeModal called on Escape
```

### Issue: Custom buttons not keyboard accessible

**Problem:** `<div onclick="...">` doesn't respond to Enter/Space

**Solution:**
```typescript
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>
```

### Issue: Form labels not associated with inputs

**Problem:** Screen reader doesn't announce label for input

**Solution:**
```typescript
// Bad
<label>Email</label>
<input type="email" />

// Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

---

## Related Documentation

- [WCAG 2.1 Keyboard Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN: Keyboard Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_custom_components)
- [WebAIM: Keyboard Accessibility](https://webaim.org/articles/keyboard/)

---

## Contributing

When contributing keyboard accessibility improvements:

1. Read this guide entirely
2. Follow the patterns and examples provided
3. Test with keyboard-only navigation (unplug mouse)
4. Test with screen reader (NVDA/JAWS/VoiceOver)
5. Add tests for keyboard functionality
6. Update documentation if new patterns introduced
7. Reference WCAG criteria in commit messages

---

**Created by:** @dev (Dex)
**Last Updated:** 2026-02-02
**Next Review:** 2026-03-02
