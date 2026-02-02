
/**
 * Safe access to environment variables injected by Vite at build time.
 * Uses global constants (__GEMINI_API_KEY__, etc.) instead of import.meta.env
 * to prevent accidental exposure in source maps.
 */
export const getEnv = (key: string): string => {
  try {
    switch (key) {
      case 'VITE_GEMINI_API_KEY':
        // Using global constant injected by Vite (safe - not in source code)
        if (typeof __GEMINI_API_KEY__ !== 'undefined' && __GEMINI_API_KEY__) {
          return __GEMINI_API_KEY__;
        }
        console.warn('[getEnv] VITE_GEMINI_API_KEY não configurada!');
        return '';
      case 'SUPABASE_URL':
        // @ts-ignore
        return typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '';
      case 'SUPABASE_ANON_KEY':
        // @ts-ignore
        return typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '';
      case 'SENTRY_DSN':
        // @ts-ignore
        return typeof __SENTRY_DSN__ !== 'undefined' ? __SENTRY_DSN__ : '';
      default:
        return '';
    }
  } catch (e) {
    console.warn('[getEnv] Erro ao ler variável de ambiente:', key);
    return '';
  }
};
