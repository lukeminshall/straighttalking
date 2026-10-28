import { useEffect, useMemo, useState } from 'react'
import { clinics } from '@/data/board'
import { reference } from '@/lib/format'
import { useDemo } from '@/demo/DemoContext'
import { Icon } from '@/components/ui/Icon'
import styles from './FeedbackFlow.module.css'

type Intent = 'compliment' | 'concern' | 'comment' | null

interface FeedbackFlowProps {
  open: boolean
  onClose: () => void
}

const RATING_WORDS = ['', 'We’re sorry to hear that', 'Not the visit we want for you', 'A mixed one, thank you for telling us', 'Glad it went well', 'Wonderful, thank you']

// Plain context for the visit. Not a clinical pathway — just helps us read the
// feedback and point you at the right people.
interface Pathway {
  id: string
  label: string
  icon: string
}
const PATHWAYS: Pathway[] = [
  { id: 'scan', label: 'A scan, X-ray or test', icon: '◎' },
  { id: 'procedure', label: 'An operation or procedure', icon: '✚' },
  { id: 'appt', label: 'An appointment or consultation', icon: '☷' },
  { id: 'other', label: 'Something else', icon: '∙' },
]
const PATHWAY_BY_ID = Object.fromEntries(PATHWAYS.map((p) => [p.id, p]))

export function FeedbackFlow({ open, onClose }: FeedbackFlowProps) {
  const demo = useDemo()
  const [stepKey, setStepKey] = useState('start')
  const [site, setSite] = useState('')
  const [pathway, setPathway] = useState('')
  const [starsValue, setStarsValue] = useState(0)
  const [scale, setScale] = useState(0)
  const [intent, setIntent] = useState<Intent>(null)
  const [text, setText] = useState('')
  const [wantReply, setWantReply] = useState(false)
  const [wantShare, setWantShare] = useState(true)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const ref = useMemo(() => reference(), [])

  const pathObj = pathway ? PATHWAY_BY_ID[pathway] : undefined

  const steps = ['start', 'rating', 'intent', 'text', 'send', 'done']
  const idx = Math.max(0, steps.indexOf(stepKey))

  useEffect(() => {
    if (open) {
      reset()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const positive = starsValue >= 4
  const negative = starsValue > 0 && starsValue <= 2

  function reset() {
    setStepKey('start')
    setSite('')
    setPathway('')
    setStarsValue(0)
    setScale(0)
    setIntent(null)
    setText('')
    setWantReply(false)
    setWantShare(true)
    setEmail('')
    setSending(false)
    setErrMsg('')
  }

  const next = () => setStepKey(steps[Math.min(steps.length - 1, idx + 1)])
  const back = () => setStepKey(steps[Math.max(0, idx - 1)])

  const send = async () => {
    if (sending) return
    setSending(true)
    setErrMsg('')
    const chosenIntent: Exclude<Intent, null> = intent ?? 'comment'
    const service = pathObj ? pathObj.label : ''
    try {
      // In production this persists via the live provider; in the demo shell it
      // drives the on-screen counters. FeedbackFlow itself stays backend-agnostic
      // so the static single-file viewer never bundles the backend client.
      await demo.submit({
        intent: chosenIntent,
        rating: starsValue,
        text,
        service,
        site: site ? site.split(' ')[0] : '',
        reference: ref,
        recommend: scale,
        shareConsent: wantShare && positive,
        replyEmail: wantReply ? email : undefined,
      })
      setStepKey('done')
    } catch {
      setErrMsg('Sorry, that didn’t send. Please check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  const intentCopy: Record<Exclude<Intent, null>, { title: string; hint: string }> = {
    compliment: { title: 'Who or what made the difference?', hint: 'Name a team member if you like, we love passing praise on.' },
    concern: { title: 'Tell us what could have been better', hint: 'As much detail as you can. This goes straight to the practice team.' },
    comment: { title: "What’s on your mind?", hint: 'Any thought at all. No category needed.' },
  }

  const pick = (kind: Exclude<Intent, null>) => {
    setIntent(kind)
    next()
  }

  const doneConcern = intent === 'concern' || negative

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Say it straight">
        <div className={styles.phead}>
          <div className={styles.pips}>
            {steps.map((_, i) => (
              <span key={i} className={styles.pip} data-on={i <= idx} />
            ))}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.pbody}>
          {stepKey === 'start' && (
            <div className={styles.screen}>
              <h2>What were you seen for?</h2>
              <p className={styles.hint}>Just so we can read your feedback in context. Most people only need a quick word, and that is all this takes.</p>
              <div className={styles.seen}>
                {PATHWAYS.map((p) => (
                  <button key={p.id} className={styles.seenOpt} data-on={pathway === p.id} onClick={() => setPathway(p.id)}>
                    <span className={styles.seenIc} aria-hidden="true">{p.icon}</span>
                    <span>{p.label}</span>
                    {pathway === p.id && <span className={styles.seenTick}>✓</span>}
                  </button>
                ))}
              </div>
              <label className={styles.lbl} style={{ marginTop: 18 }}>
                Which clinic? <span className={styles.opt}>(optional)</span>
              </label>
              <select className={styles.field} value={site} onChange={(e) => setSite(e.target.value)}>
                <option value="">Choose a clinic…</option>
                {clinics.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className={styles.actions}>
                <span />
                <button className={styles.primary} disabled={!pathway} onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {stepKey === 'rating' && (
            <div className={styles.screen}>
              <h2>How was it, overall?</h2>
              <p className={styles.hint}>One tap. Be honest, there are no wrong answers here.</p>
              <div className={styles.stars} role="radiogroup" aria-label="Overall rating">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span key={v} className={styles.star} data-lit={v <= starsValue} onClick={() => setStarsValue(v)}>
                    ★
                  </span>
                ))}
              </div>
              <div className={styles.rword}>{RATING_WORDS[starsValue]}</div>
              <label className={styles.lbl}>How likely are you to recommend us to friends or family?</label>
              <div className={styles.scale}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} data-sel={v === scale} onClick={() => setScale(v)}>
                    {v}
                  </button>
                ))}
              </div>
              <div className={styles.ends}>
                <span>Not likely</span>
                <span>Extremely likely</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <button className={styles.primary} disabled={!starsValue} onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {stepKey === 'intent' && (
            <div className={styles.screen}>
              <h2>{positive ? 'Sounds like a good visit.' : negative ? 'Thank you for being honest.' : 'What would you like to do?'}</h2>
              <p className={styles.hint}>
                {positive
                  ? 'Would you share it? A few kind words help the next anxious patient feel safe choosing this practice.'
                  : negative
                    ? 'We’d like to put this right. Telling the team sends it to them today.'
                    : 'Pick whatever fits. You can say one thing or all three.'}
              </p>
              {positive && (
                <div className={styles.nudge}>
                  <b>One tap to share.</b> We'll pre-fill your rating so leaving a public review takes seconds. Totally optional.
                </div>
              )}
              {negative && (
                <div className={`${styles.nudge} ${styles.care}`}>
                  <b>We're listening.</b> What you tell us goes straight to the practice team so nothing gets lost.
                </div>
              )}
              <button className={`${styles.door} ${styles.compliment}`} onClick={() => pick('compliment')}>
                <span className={styles.doorIc}><Icon name="heart" size={20} /></span>
                <span>
                  <b>Leave a compliment</b>
                  <em>Thank a team member or tell us what went well.</em>
                </span>
              </button>
              <button className={`${styles.door} ${styles.concern}`} onClick={() => pick('concern')}>
                <span className={styles.doorIc}><Icon name="alert" size={20} /></span>
                <span>
                  <b>Raise a concern</b>
                  <em>Something wasn't right. This goes to the practice team today.</em>
                </span>
              </button>
              <button className={`${styles.door} ${styles.comment}`} onClick={() => pick('comment')}>
                <span className={styles.doorIc}><Icon name="pencil" size={20} /></span>
                <span>
                  <b>Just leave a comment</b>
                  <em>Any thought, big or small. No category needed.</em>
                </span>
              </button>
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <span />
              </div>
            </div>
          )}

          {stepKey === 'text' && intent && (
            <div className={styles.screen}>
              <h2>{intentCopy[intent].title}</h2>
              <p className={styles.hint}>{intentCopy[intent].hint}</p>
              {intent === 'concern' && (
                <div className={styles.privacy}>
                  <span className={styles.privIc}><Icon name="doc" size={18} /></span>
                  <div>
                    <b>Goes to the practice team.</b> Flagged for someone to read and follow up, so it isn’t lost in a form.
                  </div>
                </div>
              )}
              <textarea
                className={styles.field}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What happened, and how did it make you feel?"
                rows={5}
              />
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <button className={styles.primary} onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {stepKey === 'send' && (
            <div className={styles.screen}>
              <h2>Before you send</h2>
              <p className={styles.hint}>Your feedback is anonymous. These are optional, and yours to choose.</p>
              <div className={styles.privacy}>
                <span className={styles.privIc}><Icon name="lock" size={18} /></span>
                <div>
                  <b>No personal details are attached.</b> You are saved as a private reference and your service only.
                </div>
              </div>
              {intent === 'compliment' && (
                <label className={`${styles.consent} ${styles.followup}`}>
                  <input type="checkbox" checked={wantShare} onChange={(e) => setWantShare(e.target.checked)} />
                  <span>
                    <b>Happy for this to be shared anonymously.</b> We may show it on our waiting-room board or invite you to post it as a public review. Never with any detail that identifies you.
                  </span>
                </label>
              )}
              <label className={styles.consent}>
                <input type="checkbox" checked={wantReply} onChange={(e) => setWantReply(e.target.checked)} />
                <span>
                  <b>I'd like a reply.</b> Add an email if you want us to come back to you. Stored separately from your feedback, never alongside it.
                </span>
              </label>
              {wantReply && (
                <>
                  <label className={styles.lbl} style={{ marginTop: 4 }}>
                    Email
                  </label>
                  <input className={styles.field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </>
              )}
              {errMsg && <div className={`${styles.nudge} ${styles.care}`} style={{ marginTop: 12 }}>{errMsg}</div>}
              <div className={styles.actions}>
                <button className={styles.back} onClick={back} disabled={sending}>
                  ← Back
                </button>
                <button className={styles.primary} onClick={send} disabled={sending}>
                  {sending ? 'Sending…' : 'Send my voice'}
                </button>
              </div>
            </div>
          )}

          {stepKey === 'done' && (
            <div className={styles.screen}>
              <div className={styles.doneMark}>✓</div>
              <h2>{doneConcern ? 'We’ve heard you, and we’re on it.' : 'Your voice has been heard.'}</h2>
              <p className={styles.hint}>
                {doneConcern
                  ? 'Your concern is with the practice team. Keep your reference if you’d like to follow it up.'
                  : 'Thank you for taking the time. It genuinely helps the next person through the door.'}
              </p>
              <div className={styles.ref}>
                <span>Your reference</span>
                <b>{ref}</b>
              </div>
              <div className={styles.routed}>
                {doneConcern && <Row>Flagged to the practice team to read and follow up</Row>}
                {positive && wantShare && <Row>Ready to share as a public review in one tap</Row>}
                {wantReply && <Row>We'll reply to the email you gave, held separately from your feedback</Row>}
                <Row>Saved anonymously against {pathObj ? pathObj.label.toLowerCase() : 'your visit'}, no personal details attached</Row>
              </div>
              <div className={styles.actions} style={{ justifyContent: 'center', marginTop: 22 }}>
                <button className={styles.primary} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowDot} />
      <div>{children}</div>
    </div>
  )
}
