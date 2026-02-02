/**
 * Category Color Utility
 * Centralized color mapping for all categories (dark/light modes)
 *
 * Usage:
 *   const colors = getCategoryColor('primary');
 *   // { light: {...}, dark: {...} }
 *
 *   const mapped = getCategoryColorFromName('Desenvolvimento');
 *   // Returns: 'primary'
 */

export type CategoryColorKey = 'primary' | 'purple' | 'emerald' | 'orange' | 'rose' | 'blue';

interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
  hoverText: string;
  badge: string;
}

interface CategoryColors {
  light: CategoryColorStyle;
  dark: CategoryColorStyle;
}

/**
 * Dark mode color definitions for each category
 */
const DARK_MODE_COLORS: Record<CategoryColorKey, CategoryColorStyle> = {
  primary: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/10',
    hoverText: 'group-hover:text-cyan-400',
    badge: 'bg-cyan-950/30 text-cyan-300/70',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/10',
    hoverText: 'group-hover:text-purple-400',
    badge: 'bg-purple-950/30 text-purple-300/70',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/10',
    hoverText: 'group-hover:text-emerald-400',
    badge: 'bg-emerald-950/30 text-emerald-300/70',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/10',
    hoverText: 'group-hover:text-orange-400',
    badge: 'bg-orange-950/30 text-orange-300/70',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/10',
    hoverText: 'group-hover:text-rose-400',
    badge: 'bg-rose-950/30 text-rose-300/70',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/10',
    hoverText: 'group-hover:text-blue-400',
    badge: 'bg-blue-950/30 text-blue-300/70',
  },
};

/**
 * Light mode color definitions (consistent for all categories)
 */
const LIGHT_MODE_COLORS: CategoryColorStyle = {
  bg: 'bg-white',
  text: 'text-slate-600',
  border: 'border-slate-300',
  hoverText: 'group-hover:text-primary',
  badge: 'bg-white text-slate-600 border-slate-300 group-hover:border-primary/50 group-hover:text-primary',
};

/**
 * Get color scheme for a category (includes both light and dark modes)
 * @param colorKey - The category color key (primary, purple, emerald, orange, rose, blue)
 * @returns Object with light and dark mode styles
 *
 * @example
 * const colors = getCategoryColor('primary');
 * const darkColors = colors.dark;
 * const lightColors = colors.light;
 */
export function getCategoryColor(colorKey: CategoryColorKey): CategoryColors {
  return {
    light: LIGHT_MODE_COLORS,
    dark: DARK_MODE_COLORS[colorKey] || DARK_MODE_COLORS.primary,
  };
}

/**
 * Map a category name to its color key
 * Uses pattern matching to handle various category names
 * @param category - The category name to map
 * @returns The color key for this category
 *
 * @example
 * getCategoryColorFromName('Desenvolvimento') // Returns: 'primary'
 * getCategoryColorFromName('dados') // Returns: 'emerald'
 */
export function getCategoryColorFromName(category: string): CategoryColorKey {
  const normalized = category.toLowerCase();

  // Development/API
  if (normalized.includes('desenvolvimento') || normalized.includes('api')) return 'primary';

  // Data/Database
  if (normalized.includes('dados') || normalized.includes('data') || normalized.includes('database'))
    return 'emerald';

  // Infrastructure/Cloud
  if (normalized.includes('infra') || normalized.includes('cloud') || normalized.includes('devops'))
    return 'blue';

  // Agile/Product
  if (normalized.includes('agile') || normalized.includes('produto') || normalized.includes('scrum'))
    return 'orange';

  // Security
  if (normalized.includes('segurança') || normalized.includes('security'))
    return 'rose';

  // Backend/Web3
  if (normalized.includes('backend') || normalized.includes('web3'))
    return 'purple';

  // Default fallback
  return 'primary';
}
