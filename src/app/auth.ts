// Clerk configuration flag. Operator auth is optional: when no publishable key is
// set (local dev, preview deploys), the operator surfaces stay open so the app is
// still demoable. In production, set VITE_CLERK_PUBLISHABLE_KEY and /app is gated.
export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
export const hasClerk = Boolean(CLERK_KEY)
