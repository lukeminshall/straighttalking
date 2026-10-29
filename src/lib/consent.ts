/**
 * Cookie / storage consent — the single source of truth for what non-essential
 * storage the visitor has agreed to.
 *
 * Import-free by design: this module touches only the browser (localStorage +
 * a custom event) and imports nothing from the backend, Clerk or the router, so
 * it is safe to bundle into any entry point, including the single-file viewer.
 *
 * The app is currently essential-only: strictly-necessary storage (this consent
 * record, the Supabase/Clerk session for signed-in operators) always runs; the
 * "analytics" category is off until the visitor opts in and nothing reads it yet,
 * so the category exists to keep the banner honest and ready rather than to gate
 * live tracking today.
 */

export type ConsentCategory = 'necessary' | 'analytics'

export interface ConsentChoice {
  /** Strictly-necessary storage. Always true — shown, never switchable. */
  necessary: true
  /** Optional analytics/measurement storage. False until the visitor opts in. */
  analytics: boolean
  /** ISO timestamp of the decision, so we can re-ask if the policy changes. */
  decidedAt: string
  /** Policy version the choice was made against (bump to re-prompt everyone). */
  version: number
}

/** Bump when the cookie policy materially changes, to re-prompt all visitors. */
export const CONSENT_VERSION = 1

const KEY = 'st-consent'
export const CONSENT_EVENT = 'st:consent'

function safeGet(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentChoice>
    if (parsed.version !== CONSENT_VERSION) return null
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : new Date().toISOString(),
      version: CONSENT_VERSION,
    }
  } catch {
    // Private mode, disabled storage, or malformed value — treat as undecided.
    return null
  }
}

/** The stored choice, or null if the visitor has not decided yet. */
export function getConsent(): ConsentChoice | null {
  return safeGet()
}

/** True once the visitor has made (and we could persist) any decision. */
export function hasDecided(): boolean {
  return safeGet() !== null
}

/** Whether a given non-necessary category is currently allowed. */
export function consentAllows(category: ConsentCategory): boolean {
  if (category === 'necessary') return true
  const c = safeGet()
  return c ? c[category] : false
}

/** Persist a decision and notify listeners (same tab + other tabs). */
export function setConsent(choice: { analytics: boolean }): ConsentChoice {
  const value: ConsentChoice = {
    necessary: true,
    analytics: choice.analytics,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // If we can't persist, the banner simply shows again next load. No throw —
    // a storage failure must never break the page.
  }
  try {
    window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: value }))
  } catch {
    /* no-op */
  }
  return value
}

/** Clear the decision so the banner re-appears (used by "Cookie preferences"). */
export function reopenConsent(): void {
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }))
  } catch {
    /* no-op */
  }
}
