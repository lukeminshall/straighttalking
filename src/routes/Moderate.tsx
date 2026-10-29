import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { useOperator } from '@/app/operator-context'
import styles from './Moderate.module.css'

function when(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const INTENT_TONE: Record<string, string> = { concern: 'concern', compliment: 'praise', comment: 'neutral' }

export function Moderate() {
  const op = useOperator()
  const [busy, setBusy] = useState<string | null>(null)

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusy(id)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <Logo variant="colour" height={28} />
          <div className={styles.barRight}>
            <Link to="/app" className={styles.back}>
              ← Dashboard
            </Link>
            {op.live && op.signedIn && (
              <button className={styles.signout} onClick={() => void op.signOut()}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.app}>
        <header className={styles.head}>
          <h1>Moderation</h1>
          <p className={styles.lead}>
            Concerns flagged for the practice team, and anything patients have reported in the peer-support space. Review it here and act.
          </p>
        </header>

        {!op.live && (
          <div className={styles.notice}>
            Moderation shows live data once the backend and operator sign-in are connected. There's nothing to review in preview mode.
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.secHead}>
            <h2>Flagged feedback</h2>
            <span className={styles.count}>{op.flagged.length}</span>
          </div>
          {op.live && op.flagged.length === 0 ? (
            <div className={styles.empty}>Nothing flagged. Concerns and low ratings land here for a first response.</div>
          ) : (
            <div className={styles.list}>
              {op.flagged.map((f) => (
                <article key={f.id} className={styles.card} data-tone={INTENT_TONE[f.intent] ?? 'neutral'}>
                  <div className={styles.cardTop}>
                    <span className={styles.tag} data-tone={INTENT_TONE[f.intent] ?? 'neutral'}>
                      {f.intent}
                    </span>
                    {f.rating != null && <span className={styles.rating}>{'★'.repeat(f.rating)}{'☆'.repeat(Math.max(0, 5 - f.rating))}</span>}
                    {f.service && <span className={styles.svc}>{f.service}</span>}
                    <span className={styles.ref}>{f.reference}</span>
                    <span className={styles.time}>{when(f.created_at)}</span>
                  </div>
                  <p className={styles.body}>{f.body || <em>No written comment.</em>}</p>
                  <div className={styles.actions}>
                    <button
                      className={styles.primary}
                      disabled={busy === f.id}
                      onClick={() => void run(f.id, () => op.resolveFeedback(f.id))}
                    >
                      {busy === f.id ? 'Saving…' : 'Mark resolved'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.secHead}>
            <h2>Reported peer content</h2>
            <span className={styles.count}>{op.reports.length}</span>
          </div>
          {op.live && op.reports.length === 0 ? (
            <div className={styles.empty}>No open reports. Posts and replies patients report appear here for a decision.</div>
          ) : (
            <div className={styles.list}>
              {op.reports.map((r) => (
                <article key={r.id} className={styles.card} data-tone="concern">
                  <div className={styles.cardTop}>
                    <span className={styles.tag} data-tone="concern">
                      reported {r.target_type}
                    </span>
                    {r.alias && <span className={styles.svc}>{r.alias}</span>}
                    {r.reason && <span className={styles.reason}>“{r.reason}”</span>}
                    <span className={styles.time}>{when(r.created_at)}</span>
                  </div>
                  <p className={styles.body}>
                    {r.content != null ? r.content : <em>This content has already been removed.</em>}
                    {r.content_status === 'removed' && <span className={styles.removed}> · removed</span>}
                  </p>
                  <div className={styles.actions}>
                    <button
                      className={styles.danger}
                      disabled={busy === r.id || r.content == null}
                      onClick={() =>
                        void run(r.id, async () => {
                          if (r.target_type === 'post') await op.setPostStatus(r.target_id, 'removed')
                          else await op.setReplyStatus(r.target_id, 'removed')
                          await op.resolveReport(r.id)
                        })
                      }
                    >
                      {busy === r.id ? 'Saving…' : 'Remove content'}
                    </button>
                    <button
                      className={styles.ghost}
                      disabled={busy === r.id}
                      onClick={() => void run(r.id, () => op.resolveReport(r.id))}
                    >
                      Keep · dismiss report
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
