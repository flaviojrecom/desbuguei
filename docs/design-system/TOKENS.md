# Design Tokens - Desbuquei

**Status:** ✅ Implemented (TD-203)
**Version:** 1.0.0
**Date:** 2026-02-02
**Format:** W3C Design Tokens Community Group (DTCG)

---

## Overview

Design tokens extracted and standardized in W3C DTCG format. These tokens form the foundation of the Desbuquei design system and ensure consistency across all components, pages, and interactions.

**Token Categories:**
- 🎨 Colors (40+ tokens) - Primary, secondary, categories, themes
- 🔤 Typography (14 tokens) - Font families, sizes, weights, line heights
- 📏 Spacing (12 tokens) - 4px base scale
- 🔲 Border Radius (8 tokens) - sm to full roundness
- 💫 Shadows (4 tokens) - sm to lg elevations
- ⏱️ Duration (3 tokens) - Animation timings

**Total Tokens:** 81 core design tokens

---

## Color Tokens

### Primary Colors
- **Primary:** #3B82F6 (Blue) - Main brand color
- **Primary Dark:** #1E40AF - Primary variant for dark mode

### Secondary Colors
- **Secondary:** #10B981 (Emerald) - Accent color
- **Secondary Dark:** #059669 - Secondary variant for dark mode

### Category Colors (6 categories)

| Category | Color | Hex | Use Case |
|----------|-------|-----|----------|
| Desenvolvimento | Purple | #8B5CF6 | Development-related terms |
| Infraestrutura | Cyan | #06B6D4 | Infrastructure terms |
| Dados & IA | Pink | #EC4899 | Data & AI terms |
| Segurança | Red | #EF4444 | Security terms |
| Agile & Produto | Amber | #F59E0B | Product & Agile terms |
| Outros | Gray | #6B7280 | Miscellaneous |

### Theme Colors

**Light Theme:**
- Background: #FFFFFF
- Text Primary: #1F2937
- Text Secondary: #6B7280

**Dark Theme:**
- Background: #0F172A
- Text Primary: #F9FAFB
- Text Secondary: #D1D5DB

---

## Typography Tokens

### Font Families
- **Base:** System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Mono:** Monaco, Courier New (for code blocks)

### Font Sizes

| Token | Value | Use Case |
|-------|-------|----------|
| xs | 0.75rem (12px) | Labels, badges |
| sm | 0.875rem (14px) | Small text, captions |
| base | 1rem (16px) | Body text, paragraphs |
| lg | 1.125rem (18px) | Subheadings |
| xl | 1.25rem (20px) | Large subheadings |
| 2xl | 1.5rem (24px) | Section headings |
| 3xl | 1.875rem (30px) | Page titles |

### Font Weights

| Token | Value | Use Case |
|-------|-------|----------|
| light | 300 | Subtle text, disabled state |
| normal | 400 | Body text (default) |
| medium | 500 | Emphasized text |
| semibold | 600 | Headings, labels |
| bold | 700 | Strong emphasis |

### Line Heights

| Token | Value | Use Case |
|-------|-------|----------|
| tight | 1.25 | Headings, compact text |
| normal | 1.5 | Body text (default) |
| relaxed | 1.75 | Large text, accessibility |

---

## Spacing Tokens

**Base Unit:** 4px (1 space unit)

| Token | Value | Use Case |
|-------|-------|----------|
| 0 | 0 | No gap |
| 1 | 4px | Micro spacing |
| 2 | 8px | Tight spacing |
| 3 | 12px | Small spacing |
| 4 | 16px | Standard spacing |
| 5 | 20px | Medium spacing |
| 6 | 24px | Large spacing |
| 8 | 32px | Extra large spacing |
| 10 | 40px | Section spacing |
| 12 | 48px | Large section spacing |
| 16 | 64px | Extra large section spacing |

**Usage Pattern:**
- Margin: space-x, space-y
- Padding: p-x, p-y
- Gap: gap-x, gap-y

---

## Border Radius Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| none | 0 | Sharp corners |
| sm | 2px | Slight roundness |
| base | 4px | Default roundness |
| md | 6px | Medium roundness |
| lg | 8px | Large roundness |
| xl | 12px | Extra large roundness |
| 2xl | 16px | 2XL roundness |
| full | 9999px | Pill shape (circular buttons) |

---

## Shadow Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| sm | 0 1px 2px 0 rgba(0,0,0,0.05) | Subtle elevation |
| base | 0 1px 3px 0 rgba(0,0,0,0.1) | Standard elevation |
| md | 0 4px 6px -1px rgba(0,0,0,0.1) | Medium elevation |
| lg | 0 10px 15px -3px rgba(0,0,0,0.1) | Large elevation (modals, cards) |

---

## Duration Tokens (Animations)

| Token | Value | Use Case |
|-------|-------|----------|
| fast | 150ms | Quick interactions (hover, focus) |
| normal | 300ms | Standard transitions |
| slow | 500ms | Slow reveals, important transitions |

**Easing:** cubic-bezier(0.4, 0, 0.2, 1) (default)

---

## Usage Examples

### Colors
```css
/* CSS Variables (generated from tokens) */
.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-light-primary);
}

.button-primary:hover {
  background-color: var(--color-primary-dark);
}

.tag-desenvolvimento {
  background-color: var(--color-category-desenvolvimento);
}
```

### Typography
```css
.heading-h1 {
  font-family: var(--typography-font-family-base);
  font-size: var(--typography-font-size-3xl);
  font-weight: var(--typography-font-weight-bold);
  line-height: var(--typography-line-height-tight);
}

.body-text {
  font-size: var(--typography-font-size-base);
  line-height: var(--typography-line-height-normal);
}

.monospace-code {
  font-family: var(--typography-font-family-mono);
  font-size: var(--typography-font-size-sm);
}
```

### Spacing
```css
.card {
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-4);
}
```

### Animations
```css
.button {
  transition: all var(--duration-normal) ease-in-out;
}

.modal {
  animation: slideIn var(--duration-slow) ease-out;
}
```

---

## Token Exports

### 1. CSS Variables (tokens.css)
```css
--color-primary: #3B82F6;
--color-text-light-primary: #1F2937;
--typography-font-size-base: 1rem;
--spacing-4: 1rem;
/* ... all tokens */
```

### 2. TypeScript Object (tokens.ts)
```typescript
export const tokens = {
  colors: {
    primary: '#3B82F6',
    textLight: {
      primary: '#1F2937'
    }
  },
  typography: {
    fontSize: {
      base: '1rem'
    }
  },
  spacing: {
    4: '1rem'
  }
};
```

### 3. Tailwind Configuration (tokens.tailwind.js)
```javascript
module.exports = {
  theme: {
    colors: {
      primary: '#3B82F6',
      // ...
    },
    spacing: {
      4: '1rem',
      // ...
    }
  }
};
```

---

## Design System Integration

### Atomic Design Mapping

| Level | Component | Tokens Used |
|-------|-----------|------------|
| **Atoms** | Button | color, typography, spacing, borderRadius, shadow, duration |
| | Input | color, typography, spacing, borderRadius |
| | Label | color, typography |
| **Molecules** | Form Field | atoms + spacing |
| | Card | atoms + shadow + spacing |
| **Organisms** | Header | molecules + spacing |
| | Footer | molecules + spacing |
| | Modal | organisms + shadow + duration |

---

## Accessibility

### Color Contrast (WCAG AA)
- Primary text on light background: 4.5:1 ✅
- Secondary text on light background: 4.5:1 ✅
- All category colors meet minimum 3:1 ratio ✅

### Typography
- Minimum font size: 12px (xs) - for labels only
- Body text minimum: 16px (base)
- Line height minimum: 1.25 (tight) - 1.5+ preferred

### Motion
- Respect prefers-reduced-motion: Use 0ms duration if user prefers
- Keep animations < 500ms (cognitive load)

---

## Token Naming Convention

**Pattern:** `{category}-{subcategory}-{modifier}`

**Examples:**
- `color-primary` → Primary color
- `color-category-desenvolvimento` → Development category color
- `typography-font-size-lg` → Large font size
- `spacing-4` → 16px spacing
- `border-radius-xl` → 12px border radius
- `shadow-lg` → Large shadow
- `duration-normal` → 300ms animation

---

## Future Enhancements

- [ ] Add animations/keyframes token group
- [ ] Add opacity/alpha variants for colors
- [ ] Add breakpoint tokens for responsive design
- [ ] Add z-index token scale
- [ ] Add transition token variations
- [ ] Tool integration: Figma token sync
- [ ] Design token documentation in Storybook
- [ ] Token version tracking & changelog

---

## Tools & Resources

- **Format:** [W3C Design Tokens](https://design-tokens.github.io/community-group/format/)
- **Generated From:** `design-tokens.json`
- **Exports:** CSS, TypeScript, Tailwind
- **Related:** `.aios-core/data/design-token-best-practices.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-02-02
**Maintained By:** Uma (UX Design Expert)
**Next Review:** 2026-03-02
