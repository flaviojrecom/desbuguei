
export const getEnv = (key: string): string => {
  // O Vite substitui essas variáveis estaticamente durante o build.
  // O acesso dinâmico (env[key]) falha em produção, por isso usamos switch/case explícito.
  
  try {
    switch (key) {
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
    console.warn('Erro ao ler variável de ambiente:', key);
    return '';
  }
};
