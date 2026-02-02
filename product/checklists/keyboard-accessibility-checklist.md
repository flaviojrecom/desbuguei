# Keyboard Accessibility Review Checklist

**Used for:** Code reviews, pull requests, and final accessibility audits
**Standard:** WCAG 2.1 Level AA Keyboard Accessibility
**Document Version:** 1.0
**Last Updated:** 2026-02-02

---

## For Developers: Before Submitting PR

### Keyboard Navigation

- [ ] All interactive elements are reachable via Tab key
- [ ] Tab order follows logical visual flow (top→bottom, left→right)
- [ ] Shift+Tab navigates backwards correctly
- [ ] No positive `tabindex` values used (only `tabindex="0"`)
- [ ] Tested with keyboard only (mouse disconnected)
- [ ] No keyboard traps (focus can move through all elements)

### Focus Management

- [ ] Focus indicator visible on all interactive elements
- [ ] Focus indicator has minimum 3px width or equivalent
- [ ] Focus indicator has ≥ 3:1 contrast ratio with background
- [ ] Custom focus styles replace browser defaults (no `outline: none`)
- [ ] Focus indicator doesn't obscure content
- [ ] Focus styles consistent throughout app (using :focus-visible)

### Form Accessibility

- [ ] Form fields have associated `<label>` elements
- [ ] Label `htmlFor` attribute matches input `id`
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages have `role="alert"` for screen readers
- [ ] Form submission works with Enter key
- [ ] Form reset works via keyboard if available

### Semantic HTML

- [ ] Using `<button>` for buttons (not `<div>`, `<span>`, `<a>`)
- [ ] Using `<a>` for links (not `<button>`)
- [ ] Using `<label>` for form labels
- [ ] Using `<form>` for form containers
- [ ] Using proper heading hierarchy (`<h1>`, `<h2>`, `<h3>`, etc.)
- [ ] Using landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`)

### Modal & Dialog Accessibility

- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Modal has descriptive `aria-label`
- [ ] Escape key closes modal
- [ ] Focus is trapped within modal (Tab/Shift+Tab)
- [ ] Focus restored to trigger element on close
- [ ] All interactive elements within modal are keyboard accessible

### Keyboard Shortcuts

- [ ] Custom shortcuts use modifier keys (Alt+, Cmd+, Ctrl+)
- [ ] Shortcuts don't conflict with browser defaults
- [ ] Shortcuts documented in Help section
- [ ] Shortcuts work consistently throughout app
- [ ] Single-character shortcuts avoid common conflicts

### Testing Evidence

- [ ] Manual keyboard-only test completed
- [ ] Tab order verification screenshot/notes
- [ ] Focus indicator visibility verified
- [ ] Screen reader tested (NVDA/JAWS/VoiceOver)
- [ ] Unit tests written for keyboard functionality
- [ ] Accessibility audit tool run (axe DevTools, WAVE)

### Code Quality

- [ ] No `focus: outline: none` without replacement
- [ ] No `pointer-events: none` on interactive elements
- [ ] Uses CSS :focus-visible (not :focus)
- [ ] Accessibility hooks used (useKeyboardShortcut, useFocusTrap)
- [ ] Tests follow WCAG 2.1 patterns
- [ ] Code comments explain keyboard behavior where needed

---

## For Code Reviewers: During PR Review

### Review Checklist

**Semantic HTML** ✓
- [ ] Correct element types used (button, link, form, etc.)
- [ ] Heading hierarchy logical
- [ ] Landmark elements properly placed
- [ ] Form labels associated correctly

**Keyboard Navigation** ✓
- [ ] Tab order logical and complete
- [ ] No keyboard traps introduced
- [ ] All new interactive elements keyboard accessible
- [ ] Escape key handling for modals

**Focus Management** ✓
- [ ] Focus indicators visible
- [ ] Focus indicator has sufficient contrast
- [ ] No `outline: none` without replacement
- [ ] :focus-visible used consistently

**ARIA Attributes** ✓
- [ ] aria-required used for required form fields
- [ ] aria-describedby links errors/help text
- [ ] aria-label used where needed
- [ ] role attributes correct
- [ ] No ARIA misuse

**Tests** ✓
- [ ] Keyboard navigation tests present
- [ ] Focus management tests present
- [ ] Form submission tests include keyboard
- [ ] Tests follow accessibility patterns

**Documentation** ✓
- [ ] New shortcuts documented
- [ ] Keyboard behavior documented
- [ ] Comments explain non-obvious patterns
- [ ] WCAG criteria referenced if relevant

### Review Questions

When reviewing, ask:

1. **Can this be used with keyboard only?**
   - Test: Tab through all interactive elements
   - Test: Verify no keyboard traps

2. **Is focus always visible?**
   - Test: Compare to design specifications
   - Test: Check contrast ratio

3. **Are all form fields properly labeled?**
   - Test: Check label-input associations
   - Test: Verify error messaging

4. **Do keyboard shortcuts conflict with browser?**
   - Verify: Alt+, Cmd+, Ctrl+ combinations
   - Check: No single-key conflicts

5. **Is focus managed correctly in modals?**
   - Test: Tab behavior within modal
   - Test: Escape key functionality
   - Test: Focus restoration on close

### Red Flags ⚠️

Reject if PR contains:

- [ ] `outline: none` without replacement focus style
- [ ] Custom tabindex > 0 (except very specific cases)
- [ ] Interactive div without proper ARIA roles
- [ ] Form inputs without labels
- [ ] Modal without focus trap or Escape handling
- [ ] Keyboard shortcuts conflicting with browser
- [ ] No keyboard navigation tests
- [ ] Inaccessible color contrast on focus indicator

---

## For QA: Before Deployment

### Manual Testing Checklist

**Keyboard Navigation**
- [ ] Tab through entire app (all pages)
- [ ] Shift+Tab backwards works correctly
- [ ] Tab order matches visual flow
- [ ] No keyboard traps encountered

**Focus Indicators**
- [ ] Focus outline visible on all buttons
- [ ] Focus outline visible on all links
- [ ] Focus outline visible on all form inputs
- [ ] Focus outline visible in all themes (light/dark)
- [ ] Focus outline doesn't obscure content
- [ ] Outline width sufficient (≥ 3px)

**Forms**
- [ ] Form fields have visible labels
- [ ] Required fields marked clearly
- [ ] Error messages display properly
- [ ] Enter key submits forms
- [ ] Tab moves between fields logically

**Modals**
- [ ] Escape closes modal
- [ ] Focus trapped in modal (Tab stays inside)
- [ ] Focus returned to trigger on close
- [ ] Close button keyboard accessible
- [ ] All modal content keyboard accessible

**Page-Specific Features**
- [ ] Voice assistant opens with Alt+V
- [ ] Settings page navigable with arrow keys
- [ ] Character selection works with Space
- [ ] All pages tested with Tab/Shift+Tab

### Automated Testing

- [ ] axe DevTools: 0 CRITICAL keyboard issues
- [ ] WAVE: 0 CRITICAL keyboard issues
- [ ] axe-core tests pass
- [ ] Unit tests pass (especially keyboard tests)
- [ ] All custom shortcuts documented

### Screen Reader Testing

Using NVDA (Windows), JAWS, or VoiceOver (Mac):

- [ ] Page structure announced correctly
- [ ] Form labels announced with inputs
- [ ] Error messages announced with alert role
- [ ] Button purposes clear
- [ ] Landmarks identified
- [ ] Navigation logical

### Browser Testing

Verify keyboard behavior on:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Safari (iOS)
- [ ] Mobile browsers (if applicable)

---

## For Accessibility Audit: Final Review

### Comprehensive Audit

**Coverage**
- [ ] All pages tested
- [ ] All interactive elements tested
- [ ] All forms tested
- [ ] All modals tested
- [ ] All custom components tested

**Keyboard Navigation**
- [ ] 100% of interactive elements keyboard accessible
- [ ] Tab order verified on all pages
- [ ] No keyboard traps anywhere
- [ ] Logical flow maintained

**Focus Management**
- [ ] Focus indicator visible everywhere
- [ ] Focus indicator contrast ≥ 3:1
- [ ] Focus indicator size ≥ 3px
- [ ] Focus outline not removed without replacement

**WCAG 2.1 Level AA Compliance**
- [ ] 2.1.1 Keyboard: All functionality available via keyboard
- [ ] 2.1.2 No Keyboard Trap: Focus can move between elements
- [ ] 2.4.3 Focus Order: Tab order logical
- [ ] 2.4.7 Focus Visible: Focus indicator visible
- [ ] 3.2.1 On Focus: No unexpected context changes on focus

**Documentation**
- [ ] Keyboard shortcuts documented
- [ ] Developer guide accessible
- [ ] Help modal available to users
- [ ] Accessibility notes in code

### Tools & Reports

- [ ] axe DevTools audit: Pass ✓
- [ ] WAVE audit: Pass ✓
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Unit test coverage ≥ 90%
- [ ] Manual testing report attached
- [ ] Screen reader testing verified

### Sign-Off

- [ ] Accessibility QA approved
- [ ] No critical keyboard issues
- [ ] WCAG 2.1 Level AA verified
- [ ] Ready for production deployment

---

## Issue Tracker

### Common Issues

**Issue:** Focus indicator not visible
- **Solution:** Add :focus-visible styles, minimum 3px outline
- **WCAG:** 2.4.7 Focus Visible

**Issue:** Tab order incorrect
- **Solution:** Review DOM order, use semantic HTML
- **WCAG:** 2.4.3 Focus Order

**Issue:** Keyboard trap in modal
- **Solution:** Implement focus trap or allow Escape
- **WCAG:** 2.1.2 No Keyboard Trap

**Issue:** Form labels missing
- **Solution:** Add `<label htmlFor="id">` associations
- **WCAG:** 1.3.1 Info & Relationships

**Issue:** Custom buttons not keyboard accessible
- **Solution:** Use `<button>` or add keyboard event handlers
- **WCAG:** 2.1.1 Keyboard

### Reporting Issues

When logging keyboard accessibility issues:

1. **Title:** Clear, specific (e.g., "Focus indicator missing on submit button")
2. **Steps:** How to reproduce with keyboard only
3. **Expected:** What should happen (e.g., "Button should show 3px outline")
4. **Actual:** What actually happens
5. **WCAG:** Reference specific criterion (e.g., "2.4.7 Focus Visible")
6. **Priority:** Critical/High/Medium/Low

---

## Resources

- [WCAG 2.1 Keyboard Criteria](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [Developer Guide](./keyboard-accessibility.md)
- [Test Tools: axe DevTools, WAVE, Lighthouse](https://www.w3.org/WAI/test-evaluate/tools/)
- [Screen Readers: NVDA, JAWS, VoiceOver](https://www.w3.org/WAI/users/tools-and-techniques/)

---

**Version History:**
- 1.0 - 2026-02-02 - Initial version

**Next Review Date:** 2026-03-02
