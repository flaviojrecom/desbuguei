
export const getEnv = (key: string): string => {
  // O Vite substitui essas variáveis estaticamente durante o build.
  // O acesso dinâmico (env[key]) falha em produção, por isso usamos switch/case explícito.

  try {
    switch (key) {
      case 'VITE_GEMINI_API_KEY':
        // @ts-ignore
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!geminiKey) {
          console.warn('[getEnv] VITE_GEMINI_API_KEY não configurada!');
        } else {
          console.log('[getEnv] VITE_GEMINI_API_KEY carregada com sucesso (primeiros 10 chars):', geminiKey.substring(0, 10) + '...');
        }
        return geminiKey;
      case 'API_KEY':
        // @ts-ignore
        return import.meta.env.VITE_API_KEY || '';
      case 'ADMIN_PASSWORD':
        // @ts-ignore
        return import.meta.env.VITE_ADMIN_PASSWORD || '';
      case 'SUPABASE_URL':
        // @ts-ignore
        return import.meta.env.VITE_SUPABASE_URL || '';
      case 'SUPABASE_ANON_KEY':
        // @ts-ignore
        return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      case 'SENTRY_DSN':
        // @ts-ignore
        return import.meta.env.VITE_SENTRY_DSN || '';
      default:
        return '';
    }
  } catch (e) {
    console.warn('[getEnv] Erro ao ler variável de ambiente:', key);
    return '';
  }
};
