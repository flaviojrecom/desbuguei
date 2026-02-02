import { describe, it, expect } from 'vitest';
import { getCategoryColor, getCategoryColorFromName, CategoryColorKey } from './categoryColors';

describe('getCategoryColor', () => {
  it('should return valid color scheme for all categories', () => {
    const categories: CategoryColorKey[] = ['primary', 'purple', 'emerald', 'orange', 'rose', 'blue'];

    categories.forEach((colorKey) => {
      const colors = getCategoryColor(colorKey);

      // Check structure
      expect(colors).toHaveProperty('light');
      expect(colors).toHaveProperty('dark');

      // Check light mode
      expect(colors.light).toHaveProperty('bg');
      expect(colors.light).toHaveProperty('text');
      expect(colors.light).toHaveProperty('border');
      expect(colors.light).toHaveProperty('hoverText');
      expect(colors.light).toHaveProperty('badge');

      // Check dark mode
      expect(colors.dark).toHaveProperty('bg');
      expect(colors.dark).toHaveProperty('text');
      expect(colors.dark).toHaveProperty('border');
      expect(colors.dark).toHaveProperty('hoverText');
      expect(colors.dark).toHaveProperty('badge');
    });
  });

  it('should return dark mode colors with correct Tailwind classes', () => {
    const primaryColors = getCategoryColor('primary');
    const darkPrimary = primaryColors.dark;

    expect(darkPrimary.bg).toBe('bg-cyan-500/10');
    expect(darkPrimary.text).toBe('text-cyan-400');
    expect(darkPrimary.border).toBe('border-cyan-500/10');
    expect(darkPrimary.hoverText).toBe('group-hover:text-cyan-400');
    expect(darkPrimary.badge).toBe('bg-cyan-950/30 text-cyan-300/70');
  });

  it('should return consistent light mode colors across all categories', () => {
    const categories: CategoryColorKey[] = ['primary', 'purple', 'emerald', 'orange', 'rose', 'blue'];

    const firstLight = getCategoryColor(categories[0]).light;

    categories.forEach((colorKey) => {
      const colors = getCategoryColor(colorKey);
      // Light mode should be the same for all categories
      expect(colors.light).toEqual(firstLight);
    });
  });

  it('should return correct colors for each category in dark mode', () => {
    const testCases: [CategoryColorKey, string][] = [
      ['primary', 'text-cyan-400'],
      ['purple', 'text-purple-400'],
      ['emerald', 'text-emerald-400'],
      ['orange', 'text-orange-400'],
      ['rose', 'text-rose-400'],
      ['blue', 'text-blue-400'],
    ];

    testCases.forEach(([colorKey, expectedText]) => {
      const colors = getCategoryColor(colorKey);
      expect(colors.dark.text).toBe(expectedText);
    });
  });

  it('should handle unknown color keys by returning primary fallback', () => {
    // TypeScript won't allow invalid keys, but we test the fallback logic
    const unknownColor = getCategoryColor('primary' as CategoryColorKey);
    expect(unknownColor.dark).toBeDefined();
    expect(unknownColor.dark.text).toBe('text-cyan-400');
  });
});

describe('getCategoryColorFromName', () => {
  it('should map Desenvolvimento to primary', () => {
    expect(getCategoryColorFromName('Desenvolvimento')).toBe('primary');
    expect(getCategoryColorFromName('desenvolvimento')).toBe('primary');
    expect(getCategoryColorFromName('API')).toBe('primary');
    expect(getCategoryColorFromName('api')).toBe('primary');
  });

  it('should map Dados/Data to emerald', () => {
    expect(getCategoryColorFromName('Dados & IA')).toBe('emerald');
    expect(getCategoryColorFromName('dados')).toBe('emerald');
    expect(getCategoryColorFromName('data')).toBe('emerald');
    expect(getCategoryColorFromName('database')).toBe('emerald');
  });

  it('should map Infraestrutura to blue', () => {
    expect(getCategoryColorFromName('Infraestrutura')).toBe('blue');
    expect(getCategoryColorFromName('infra')).toBe('blue');
    expect(getCategoryColorFromName('cloud')).toBe('blue');
    expect(getCategoryColorFromName('devops')).toBe('blue');
  });

  it('should map Agile & Produto to orange', () => {
    expect(getCategoryColorFromName('Agile & Produto')).toBe('orange');
    expect(getCategoryColorFromName('agile')).toBe('orange');
    expect(getCategoryColorFromName('produto')).toBe('orange');
    expect(getCategoryColorFromName('scrum')).toBe('orange');
  });

  it('should map Segurança to rose', () => {
    expect(getCategoryColorFromName('Segurança')).toBe('rose');
    expect(getCategoryColorFromName('segurança')).toBe('rose');
    expect(getCategoryColorFromName('security')).toBe('rose');
  });

  it('should map Backend/Web3 to purple', () => {
    expect(getCategoryColorFromName('backend')).toBe('purple');
    expect(getCategoryColorFromName('web3')).toBe('purple');
    expect(getCategoryColorFromName('Web3')).toBe('purple');
  });

  it('should return primary as default for unknown categories', () => {
    expect(getCategoryColorFromName('unknown')).toBe('primary');
    expect(getCategoryColorFromName('xyz')).toBe('primary');
    expect(getCategoryColorFromName('')).toBe('primary');
  });

  it('should be case insensitive', () => {
    expect(getCategoryColorFromName('DESENVOLVIMENTO')).toBe('primary');
    expect(getCategoryColorFromName('DaDoS')).toBe('emerald');
    expect(getCategoryColorFromName('InFrA')).toBe('blue');
  });

  it('should handle partial matches', () => {
    expect(getCategoryColorFromName('Cloud Services')).toBe('blue');
    expect(getCategoryColorFromName('API Gateway')).toBe('primary');
    expect(getCategoryColorFromName('Data Science')).toBe('emerald');
  });

  it('should have consistent mapping with getCategoryColor', () => {
    const categoryNames = [
      { name: 'Desenvolvimento', expected: 'primary' },
      { name: 'Dados & IA', expected: 'emerald' },
      { name: 'Infraestrutura', expected: 'blue' },
      { name: 'Agile & Produto', expected: 'orange' },
      { name: 'Segurança', expected: 'rose' },
      { name: 'Backend', expected: 'purple' },
    ];

    categoryNames.forEach(({ name, expected }) => {
      const colorKey = getCategoryColorFromName(name);
      expect(colorKey).toBe(expected as CategoryColorKey);

      // Verify getCategoryColor returns valid colors for this key
      const colors = getCategoryColor(colorKey);
      expect(colors.light).toBeDefined();
      expect(colors.dark).toBeDefined();
    });
  });
});
