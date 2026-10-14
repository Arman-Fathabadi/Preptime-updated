import { betterAuth } from 'better-auth';
import { getPool } from './db';

/**
 * Accounts are optional: with no DATABASE_URL / OAuth keys the app runs exactly as before
 * (guest mode, data in this browser). Providers switch on when their keys exist.
 */
export const authEnabled = !!(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);

const social = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          // Needed so the optional Calendar connection gets a refresh token and keeps working after an hour.
          accessType: 'offline' as const,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? { github: { clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET } }
    : {}),
};

export const auth = betterAuth({
  database: authEnabled ? getPool() : (undefined as never),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Preview deployments get their own *.vercel.app host; allow those to sign in too.
  trustedOrigins: ['https://*.vercel.app'],
  socialProviders: social,
  account: {
    accountLinking: {
      enabled: true,
      // Both providers hand over an email they have verified, so the same person signing in
      // with Google one day and GitHub the next lands in the same account.
      trustedProviders: ['google', 'github'],
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, cookieCache: { enabled: true, maxAge: 5 * 60 } },
});
