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

const RATING_WORDS = ['', 'We\u2019re sorry to hear that', 'Not the visit we want for you', 'A mixed one, thank you for telling us', 'Glad it went well', 'Wonderful, thank you']

// Patient self-declares what they were seen for; this maps to the instrument.
interface Pathway {
  id: string
  label: string
  icon: string
  instrument: string | null
  prom: string | null
}
const PATHWAYS: Pathway[] = [
  { id: 'scan', label: 'A scan, X-ray or test', icon: '\u25ce', instrument: 'EQ-5D-5L', prom: 'eq5d' },
  { id: 'knee', label: 'Knee surgery or replacement', icon: '\u25b3', instrument: 'Oxford Knee Score', prom: 'knee' },
  { id: 'hip', label: 'Hip surgery or replacement', icon: '\u25b3', instrument: 'Oxford Hip Score', prom: 'hip' },
  { id: 'cataract', label: 'Cataract or eye surgery', icon: '\u25c9', instrument: 'Cat-PROM5', prom: 'cataract' },
  { id: 'other', label: 'Another operation or procedure', icon: '\u271a', instrument: 'EQ-5D-5L', prom: 'eq5d' },
  { id: 'appt', label: 'Just an appointment or consultation', icon: '\u2637', instrument: null, prom: null },
]
const PATHWAY_BY_ID = Object.fromEntries(PATHWAYS.map((p) => [p.id, p]))

interface PromItem { q: string; opts: string[] }
const PROM_SETS: Record<string, { instrument: string; items: PromItem[] }> = {
  eq5d: {
    instrument: 'EQ-5D-5L',
    items: [
      { q: 'Getting around and walking about', opts: ['No problems', 'Slight', 'Moderate', 'Severe', 'Unable'] },
      { q: 'Washing and dressing yourself', opts: ['No problems', 'Slight', 'Moderate', 'Severe', 'Unable'] },
      { q: 'Your usual activities (work, chores, leisure)', opts: ['No problems', 'Slight', 'Moderate', 'Severe', 'Unable'] },
      { q: 'Pain or discomfort today', opts: ['None', 'Slight', 'Moderate', 'Severe', 'Extreme'] },
    ],
  },
  knee: {
    instrument: 'Oxford Knee Score',
    items: [
      { q: 'Pain in your knee over the last 4 weeks', opts: ['None', 'Mild', 'Moderate', 'Severe', 'Unbearable'] },
      { q: 'How far you can walk before the pain is bad', opts: ['No limit', 'A while', 'Moderate', 'Short', 'Barely'] },
      { q: 'Stairs, kneeling and getting up from a chair', opts: ['No trouble', 'A little', 'Moderate', 'A lot', 'Impossible'] },
    ],
  },
  hip: {
    instrument: 'Oxford Hip Score',
    items: [
      { q: 'Pain in your hip over the last 4 weeks', opts: ['None', 'Mild', 'Moderate', 'Severe', 'Unbearable'] },
      { q: 'How far you can walk before the pain is bad', opts: ['No limit', 'A while', 'Moderate', 'Short', 'Barely'] },
      { q: 'Dressing, socks and getting in and out of a car', opts: ['No trouble', 'A little', 'Moderate', 'A lot', 'Impossible'] },
    ],
  },
  cataract: {
    instrument: 'Cat-PROM5',
    items: [
      { q: 'How clear your vision feels day to day', opts: ['Very clear', 'Fairly', 'Mixed', 'Blurry', 'Very blurry'] },
      { q: 'Trouble with glare or bright lights', opts: ['None', 'A little', 'Moderate', 'A lot', 'Severe'] },
      { q: 'Reading, recognising faces, getting about', opts: ['No trouble', 'A little', 'Moderate', 'A lot', 'Can\u2019t manage'] },
    ],
  },
}

export function FeedbackFlow({ open, onClose }: FeedbackFlowProps) {
  const demo = useDemo()
  const [stepKey, setStepKey] = useState('start')
  const [site, setSite] = useState('')
  const [pathway, setPathway] = useState('')
  const [starsValue, setStarsValue] = useState(0)
  const [scale, setScale] = useState(0)
  const [promAns, setPromAns] = useState<Record<number, number>>({})
  const [intent, setIntent] = useState<Intent>(null)
  const [text, setText] = useState('')
  const [wantReply, setWantReply] = useState(false)
  const [wantFollowup, setWantFollowup] = useState(false)
  const [followContact, setFollowContact] = useState('')
  const [email, setEmail] = useState('')
  const ref = useMemo(() => reference(), [])

  const pathObj = pathway ? PATHWAY_BY_ID[pathway] : undefined
  const promKey = pathObj?.prom ?? null
  const hasProm = !!promKey
  const promSet = promKey ? PROM_SETS[promKey] : undefined

  const steps = ['start', 'rating', ...(hasProm ? ['prom'] : []), 'intent', 'text', 'send', 'done']
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
    setPromAns({})
    setIntent(null)
    setText('')
    setWantReply(false)
    setWantFollowup(false)
    setFollowContact('')
    setEmail('')
  }

  const next = () => setStepKey(steps[Math.min(steps.length - 1, idx + 1)])
  const back = () => setStepKey(steps[Math.max(0, idx - 1)])

  const choosePathway = (id: string) => {
    setPathway(id)
    setPromAns({})
  }

  const send = () => {
    demo.submit({
      intent: intent ?? 'comment',
      rating: starsValue,
      text,
      service: pathObj ? pathObj.label : '',
      site: site ? site.split(' ')[0] : '',
    })
    setStepKey('done')
  }

  const intentCopy: Record<Exclude<Intent, null>, { title: string; hint: string }> = {
    compliment: { title: 'Who or what made the difference?', hint: 'Name a team member if you like, we love passing praise on.' },
    concern: { title: 'Tell us what went wrong', hint: 'As much detail as you can. This reaches the care team today.' },
    comment: { title: "What\u2019s on your mind?", hint: 'Any thought at all. No category needed.' },
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
              <p className={styles.hint}>This picks the right questions for you. Most people just need a quick word, and that is all this takes.</p>
              <div className={styles.seen}>
                {PATHWAYS.map((p) => (
                  <button key={p.id} className={styles.seenOpt} data-on={pathway === p.id} onClick={() => choosePathway(p.id)}>
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
                <button className={styles.primary} onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {stepKey === 'prom' && promSet && (
            <div className={styles.screen}>
              <h2>A few quick questions</h2>
              <p className={styles.hint}>
                Because you came in for {pathObj?.label.toLowerCase()}, these track how you are now. We ask the same again after treatment, so we can see if it truly helped.
              </p>
              <div className={styles.promList}>
                {promSet.items.map((it, qi) => (
                  <div key={qi} className={styles.promItem}>
                    <div className={styles.promQ}>{it.q}</div>
                    <div className={styles.promOpts}>
                      {it.opts.map((o, oi) => (
                        <button key={oi} className={styles.promOpt} data-on={promAns[qi] === oi} onClick={() => setPromAns((a) => ({ ...a, [qi]: oi }))}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.instrNote}>
                Shown in plain words. In use this is the licensed <b>{promSet.instrument}</b>, the outcome measure PHIN and the NHS recognise.
              </div>
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

          {stepKey === 'intent' && (
            <div className={styles.screen}>
              <h2>{positive ? 'Sounds like a good visit.' : negative ? 'Thank you for being honest.' : 'What would you like to do?'}</h2>
              <p className={styles.hint}>
                {positive
                  ? 'Would you share it publicly? It helps someone anxious feel safe choosing us.'
                  : negative
                    ? 'We\u2019d like to put this right. Raising a concern sends it to the care team today.'
                    : 'Pick whatever fits. You can say one thing or all three.'}
              </p>
              {positive && (
                <div className={styles.nudge}>
                  <b>One tap to Google.</b> We'll pre-fill your rating so a public review takes seconds. Totally optional.
                </div>
              )}
              {negative && (
                <div className={`${styles.nudge} ${styles.care}`}>
                  <b>We're listening.</b> A concern is logged as a governance record so nothing gets lost.
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
                  <b>Raise a concern or complaint</b>
                  <em>Something wasn't right. This goes to the care team today.</em>
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
                    <b>Logged for governance.</b> Recorded in Datix / Radar so it is reviewed and tracked properly.
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
              {hasProm && (
                <label className={`${styles.consent} ${styles.followup}`}>
                  <input type="checkbox" checked={wantFollowup} onChange={(e) => setWantFollowup(e.target.checked)} />
                  <span>
                    <b>Yes, check how I'm getting on after treatment.</b> We'll send one short follow-up in about six months. It is what turns today's answers into a real measure of whether treatment helped, and it is the only way to complete your result.
                  </span>
                </label>
              )}
              {hasProm && wantFollowup && (
                <>
                  <label className={styles.lbl} style={{ marginTop: 4 }}>
                    Mobile or email for the follow-up
                  </label>
                  <input className={styles.field} value={followContact} onChange={(e) => setFollowContact(e.target.value)} placeholder="07… or you@example.com" />
                </>
              )}
              <label className={styles.consent}>
                <input type="checkbox" checked={wantReply} onChange={(e) => setWantReply(e.target.checked)} />
                <span>
                  <b>I'd like a reply.</b> Add an email if you want us to come back to you about a concern. Stored separately from your feedback, never alongside it.
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
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <button className={styles.primary} onClick={send}>
                  Send my voice
                </button>
              </div>
            </div>
          )}

          {stepKey === 'done' && (
            <div className={styles.screen}>
              <div className={styles.doneMark}>✓</div>
              <h2>{doneConcern ? 'We\u2019ve heard you, and we\u2019re on it.' : 'Your voice has been heard.'}</h2>
              <p className={styles.hint}>
                {doneConcern
                  ? 'Your concern is logged with the care team. Keep your reference if you\u2019d like to follow it up.'
                  : 'Thank you for taking the time. It genuinely helps the next person through the door.'}
              </p>
              <div className={styles.ref}>
                <span>Your reference</span>
                <b>{ref}</b>
              </div>
              <div className={styles.routed}>
                {doneConcern && <Row>Logged as a governance record in Datix / Radar</Row>}
                {positive && <Row>Ready to post to Google Reviews in one tap</Row>}
                {hasProm && wantFollowup && <Row>We'll send one short {promSet?.instrument} follow-up after your treatment, so today becomes a measured result</Row>}
                {hasProm && !wantFollowup && <Row>Your baseline {promSet?.instrument} is saved, add a follow-up anytime to complete it</Row>}
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
