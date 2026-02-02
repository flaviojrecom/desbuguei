/**
 * Tailwind CSS Configuration - Design Tokens Integration
 * Generated from design-tokens.json (W3C Design Tokens Community Group format)
 * Author: Uma (UX Design Expert)
 * Date: 2026-02-02
 *
 * This file integrates Desbuquei design tokens with Tailwind CSS.
 * All tokens are mapped to Tailwind utility classes automatically.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      /**
       * COLORS
       * Maps design token colors to Tailwind color utilities
       * Usage: bg-primary, text-secondary, border-category-desenvolvimento
       */
      colors: {
        // Primary Brand
        primary: '#3B82F6',
        'primary-dark': '#1E40AF',

        // Secondary Accent
        secondary: '#10B981',
        'secondary-dark': '#059669',

        // Background
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },

        // Text
        text: {
          primary: {
            light: '#1F2937',
            dark: '#F9FAFB',
          },
          secondary: {
            light: '#6B7280',
            dark: '#D1D5DB',
          },
        },

        // Category Colors
        category: {
          desenvolvimento: '#8B5CF6',
          infraestrutura: '#06B6D4',
          'dados-ia': '#EC4899',
          seguranca: '#EF4444',
          'agile-produto': '#F59E0B',
          outros: '#6B7280',
        },
      },

      /**
       * TYPOGRAPHY
       * Maps font families, sizes, and weights to Tailwind utilities
       * Usage: font-base, text-3xl, font-bold
       */
      fontFamily: {
        base: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: ["'Monaco'", "'Courier New'", "monospace"],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },

      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },

      /**
       * SPACING
       * 4px base unit scale
       * Usage: p-4, m-6, gap-2
       */
      spacing: {
        0: '0',
        1: '0.25rem', // 4px
        2: '0.5rem', // 8px
        3: '0.75rem', // 12px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        8: '2rem', // 32px
        10: '2.5rem', // 40px
        12: '3rem', // 48px
        16: '4rem', // 64px
      },

      /**
       * BORDER RADIUS
       * Usage: rounded-none, rounded-lg, rounded-full
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
       * BOX SHADOW
       * Usage: shadow-sm, shadow-base, shadow-lg
       */
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },

      /**
       * ANIMATION / TRANSITION
       * Usage: duration-300, ease-default
       */
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },

      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [],

  /**
   * DARK MODE CONFIGURATION
   * Supports both class-based and media-based dark mode
   * Set to 'class' if using [data-theme='dark'] on html element
   * Set to 'media' to respect system preference
   */
  darkMode: ['class', '[data-theme="dark"]'],
};

/**
 * USAGE EXAMPLES
 *
 * Button Primary:
 * <button className="bg-primary text-white px-6 py-4 rounded-lg
 *                    font-medium text-base hover:bg-primary-dark
 *                    transition-all duration-normal shadow-base">
 *   Click me
 * </button>
 *
 * Heading:
 * <h1 className="font-base text-3xl font-bold text-text-primary-light
 *                leading-tight mb-4">
 *   Page Title
 * </h1>
 *
 * Card:
 * <div className="bg-white dark:bg-background-dark p-6 rounded-lg
 *                 shadow-base text-text-primary-light dark:text-text-primary-dark">
 *   Card content
 * </div>
 *
 * Category Tag:
 * <span className="bg-category-desenvolvimento text-white px-3 py-2
 *                  rounded-full text-xs font-semibold">
 *   Desenvolvimento
 * </span>
 *
 * Form Input:
 * <input className="w-full px-4 py-2 border border-gray-300 rounded-lg
 *                   font-base text-base focus:outline-none
 *                   focus:ring-2 focus:ring-primary" />
 */
