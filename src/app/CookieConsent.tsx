import { useEffect, useRef, useState } from 'react'
import { CONSENT_EVENT, getConsent, hasDecided, setConsent } from '@/lib/consent'
import styles from './CookieConsent.module.css'

/**
 * A UK-GDPR / PECR-style cookie & storage consent banner.
 *
 * Shown until the visitor makes a choice. Strictly-necessary storage is always
 * on and non-switchable; analytics is off by default and requires an explicit
 * opt-in ("Accept all" or the toggle in Manage). Reject is as easy as accept.
 *
 * Router- and backend-free: it reads/writes only `@/lib/consent` (localStorage),
 * so it is safe to mount in any entry point. Mounted once in `main.tsx`.
 */
export function CookieConsent() {
  // Render decision deferred to the effect so SSR/first paint never flashes it
  // before we've read storage, and so a storage error just keeps it hidden.
  const [open, setOpen] = useState(false)
  const [managing, setManaging] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const firstBtn = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!hasDecided()) setOpen(true)
    // "Cookie preferences" (or a policy-version bump) dispatches the event; a
    // null detail means "re-open to let me change my mind".
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail === null) {
        const current = getConsent()
        setAnalytics(current?.analytics ?? false)
        setManaging(true)
        setOpen(true)
      }
    }
    window.addEventListener(CONSENT_EVENT, onEvent)
    return () => window.removeEventListener(CONSENT_EVENT, onEvent)
  }, [])

  useEffect(() => {
    if (open) firstBtn.current?.focus()
  }, [open, managing])

  if (!open) return null

  const acceptAll = () => {
    setConsent({ analytics: true })
    setOpen(false)
    setManaging(false)
  }
  const rejectNonEssential = () => {
    setConsent({ analytics: false })
    setOpen(false)
    setManaging(false)
  }
  const saveChoices = () => {
    setConsent({ analytics })
    setOpen(false)
    setManaging(false)
  }

  return (
    <div
      className={styles.wrap}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie and storage preferences"
    >
      <div className={styles.card}>
        {!managing ? (
          <>
            <div className={styles.body}>
              <h2 className={styles.title}>Your privacy on Straight Talking</h2>
              <p className={styles.text}>
                We use strictly-necessary storage to run the site and keep operators signed in — this
                is always on. We’d also like optional analytics storage to understand how the site is
                used. We set nothing optional without your say-so, and no patient-identifiable data is
                ever stored against feedback.{' '}
                <a className={styles.link} href="/privacy">
                  Read our privacy notice
                </a>
                .
              </p>
            </div>
            <div className={styles.actions}>
              <button ref={firstBtn} className={styles.primary} onClick={acceptAll}>
                Accept all
              </button>
              <button className={styles.secondary} onClick={rejectNonEssential}>
                Reject non-essential
              </button>
              <button className={styles.ghost} onClick={() => setManaging(true)}>
                Manage
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.body}>
              <h2 className={styles.title}>Manage your preferences</h2>
              <div className={styles.row}>
                <div>
                  <b>Strictly necessary</b>
                  <p className={styles.sub}>
                    Required to run the site, submit feedback and keep operators signed in. Cannot be
                    switched off.
                  </p>
                </div>
                <span className={styles.always}>Always on</span>
              </div>
              <label className={styles.row}>
                <div>
                  <b>Analytics</b>
                  <p className={styles.sub}>
                    Anonymous, aggregated measurement of how the site is used, so we can improve it.
                    Off by default.
                  </p>
                </div>
                <input
                  ref={firstBtn as unknown as React.RefObject<HTMLInputElement>}
                  className={styles.toggle}
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  aria-label="Allow analytics storage"
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={saveChoices}>
                Save choices
              </button>
              <button className={styles.secondary} onClick={rejectNonEssential}>
                Reject non-essential
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
