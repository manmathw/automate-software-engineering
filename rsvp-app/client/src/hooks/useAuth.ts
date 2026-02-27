import { useEffect } from 'react';
import { useAuthContext } from '../lib/auth/context';
import { setupInterceptors } from '../lib/api/client';

export function useAuth() {
  const ctx = useAuthContext();

  useEffect(() => {
    setupInterceptors(() => ctx.accessToken, ctx.refresh);
  }, [ctx.accessToken, ctx.refresh]);

  return ctx;
}
