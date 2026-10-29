import type { ReactNode } from 'react'
import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import { Logo } from '@/components/brand/Logo'
import { CLERK_KEY, hasClerk } from './auth'

/**
 * Wraps operator routes in Clerk when a publishable key is configured; otherwise
 * renders children directly so local dev and preview deploys stay open. This
 * module (and Clerk itself) is imported only by the production router app — never
 * by the single-file viewer.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!hasClerk) return <>{children}</>
  return (
    <ClerkProvider publishableKey={CLERK_KEY as string} afterSignOutUrl="/">
      {children}
    </ClerkProvider>
  )
}

/**
 * Gate for operator-only surfaces. With Clerk configured, signed-out visitors get
 * a sign-in screen; without it, children render with a small "auth not configured"
 * ribbon so it's obvious the gate is off.
 */
export function Protected({ children }: { children: ReactNode }) {
  if (!hasClerk) {
    return (
      <>
        <div style={ribbon}>
          Operator sign-in is not configured — this area is currently open. Set
          <code style={code}> VITE_CLERK_PUBLISHABLE_KEY </code> to lock it down.
        </div>
        {children}
      </>
    )
  }
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div style={gate}>
          <div style={{ marginBottom: 22 }}>
            <Logo variant="colour" height={34} />
          </div>
          <SignIn routing="virtual" />
        </div>
      </SignedOut>
    </>
  )
}

const gate: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  alignContent: 'center',
  gap: 4,
  background: '#f4f1e9',
  padding: 24,
}

const ribbon: React.CSSProperties = {
  background: '#fbe9df',
  color: '#8a3c28',
  borderBottom: '1px solid #f0cdbd',
  padding: '8px 16px',
  fontSize: 13,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
}

const code: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  background: '#f6d8c8',
  borderRadius: 4,
  padding: '1px 4px',
}
