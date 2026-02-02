/**
 * Design Tokens - TypeScript Object Export
 * Generated from design-tokens.json (W3C Design Tokens Community Group format)
 * Author: Uma (UX Design Expert)
 * Date: 2026-02-02
 *
 * Usage: import { tokens } from '@/tokens'
 * Type-safe access: tokens.colors.primary, tokens.spacing[4], etc.
 */

export const tokens = {
  /**
   * COLOR TOKENS (40+ tokens)
   * Primary, secondary, category colors, and theme-specific colors
   */
  colors: {
    // Primary Brand Color
    primary: '#3B82F6',
    primaryDark: '#1E40AF',

    // Secondary Accent Color
    secondary: '#10B981',
    secondaryDark: '#059669',

    // Background Colors
    background: {
      light: '#FFFFFF',
      dark: '#0F172A',
    },

    // Text Colors
    text: {
      light: {
        primary: '#1F2937',
        secondary: '#6B7280',
      },
      dark: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
      },
    },

    // Category Colors (6 categories)
    category: {
      desenvolvimento: '#8B5CF6', // Purple
      infraestrutura: '#06B6D4', // Cyan
      dadosIA: '#EC4899', // Pink
      seguranca: '#EF4444', // Red
      agileProduto: '#F59E0B', // Amber
      outros: '#6B7280', // Gray
    },
  },

  /**
   * TYPOGRAPHY TOKENS (14 tokens)
   * Font families, sizes, weights, and line heights
   */
  typography: {
    // Font Families
    fontFamily: {
      base: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'Monaco', 'Courier New', monospace",
    },

    // Font Sizes (xs to 3xl: 12px to 30px)
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },

    // Font Weights (light to bold: 300 to 700)
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  /**
   * SPACING TOKENS (12 tokens)
   * 4px base unit scale: 0px to 64px
   */
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px (standard)
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
  },

  /**
   * BORDER RADIUS TOKENS (8 tokens)
   * From sharp corners to full pill shapes
   */
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px', // Pill shape
  },

  /**
   * SHADOW TOKENS (4 tokens)
   * Elevation shadows from subtle to pronounced
   */
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  /**
   * DURATION TOKENS (3 tokens)
   * Animation timings for various interactions
   */
  duration: {
    fast: '150ms', // Quick interactions (hover, focus)
    normal: '300ms', // Standard transitions
    slow: '500ms', // Slow reveals, important transitions
  },

  /**
   * EASING TOKEN (1 token)
   * Default animation easing curve
   */
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * TYPE-SAFE ACCESS EXAMPLES
 *
 * // Colors
 * const primaryColor = tokens.colors.primary; // '#3B82F6'
 * const devCategoryColor = tokens.colors.category.desenvolvimento; // '#8B5CF6'
 *
 * // Typography
 * const headingSize = tokens.typography.fontSize['3xl']; // '1.875rem'
 * const boldWeight = tokens.typography.fontWeight.bold; // 700
 *
 * // Spacing
 * const padding = tokens.spacing[4]; // '1rem' (16px)
 *
 * // Shadows
 * const cardShadow = tokens.shadow.base;
 *
 * // Animations
 * const transitionDuration = tokens.duration.normal; // '300ms'
 */

// Export type helpers
export type ColorToken = keyof typeof tokens.colors;
export type FontSize = keyof typeof tokens.typography.fontSize;
export type FontWeight = keyof typeof tokens.typography.fontWeight;
export type SpacingToken = keyof typeof tokens.spacing;
export type BorderRadiusToken = keyof typeof tokens.borderRadius;
export type ShadowToken = keyof typeof tokens.shadow;
export type DurationToken = keyof typeof tokens.duration;

// Re-export for convenience
export default tokens;
