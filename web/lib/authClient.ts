import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

/** Providers configured for this deployment, e.g. NEXT_PUBLIC_AUTH_PROVIDERS="google,github". */
export const AUTH_PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS || '')
  .split(',')
  .map((s) => s.trim())
  .filter((s): s is 'google' | 'github' => s === 'google' || s === 'github');

export const signInWith = (provider: 'google' | 'github') => authClient.signIn.social({ provider, callbackURL: '/' });
