import { useMemo, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { RESOURCES, CATEGORIES, resourcesByCategory, ANNUAL_FEE as ANNUAL, gbp, priceLabel } from '@/data/resources'
import { Icon } from '@/components/ui/Icon'
import { QRCode } from '@/components/brand/QRCode'
import styles from './Setup.module.css'

const STEPS = ['Organisation', 'What you capture', 'Order resources', 'Review & pay', 'Add details', 'Go live']

const SETTINGS = ['NHS Trust', 'NHS Foundation Trust', 'Private hospital', 'Independent clinic', 'Diagnostic centre', 'ICB / system']

interface InstrumentOpt {
  id: string
  name: string
  note: string
  kind: 'PREM' | 'PROM' | 'Comment'
}
const INSTRUMENTS: InstrumentOpt[] = [
  { id: 'fft', name: 'Friends & Family Test', note: 'Experience at every touchpoint', kind: 'PREM' },
  { id: 'comment', name: 'Open comments', note: 'Anything on the patient’s mind', kind: 'Comment' },
  { id: 'eq5d', name: 'EQ-5D-5L', note: 'Generic outcome, any pathway', kind: 'PROM' },
  { id: 'hip', name: 'Oxford Hip Score', note: 'Hip replacement, pre + post', kind: 'PROM' },
  { id: 'knee', name: 'Oxford Knee Score', note: 'Knee replacement, pre + post', kind: 'PROM' },
  { id: 'cat', name: 'Cat-PROM5', note: 'Cataract, pre + post', kind: 'PROM' },
]

export function Setup() {
  const [step, setStep] = useState(0)
  const [org, setOrg] = useState({ name: '', type: '', sites: 1, email: '' })
  const [chosen, setChosen] = useState<Set<string>>(new Set(['fft', 'comment']))
  const [cart, setCart] = useState<Record<string, number>>(() => Object.fromEntries(RESOURCES.map((r) => [r.id, r.qty])))
  const [details, setDetails] = useState({ display: '', reviewUrl: '', governance: 'Datix' })
  const [guideOpen, setGuideOpen] = useState(true)

  const resourceTotal = useMemo(() => RESOURCES.reduce((s, r) => s + r.price * (cart[r.id] || 0), 0), [cart])
  const subTotal = ANNUAL
  const total = resourceTotal + subTotal

  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const setQty = (id: string, q: number) => setCart((c) => ({ ...c, [id]: Math.max(0, q) }))

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const step0Valid = org.name.trim() && org.type && org.email.includes('@')

  const slug =
    (org.name || 'your-clinic')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 20) || 'your-clinic'
  const liveUrl = `straighttalking.co.uk/f/${slug}`

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.brand}>
            <Logo variant="colour" height={30} />
          </div>
          <span className={styles.help}>Self-serve · live the same day</span>
        </div>
      </div>

      <div className={styles.app}>
        <aside className={styles.rail}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.railItem} data-state={i === step ? 'on' : i < step ? 'done' : 'todo'}>
              <span className={styles.railDot}>{i < step ? '✓' : i + 1}</span>
              {s}
            </div>
          ))}
          <div className={styles.railTotal}>
            <span>Estimated total</span>
            <b>{gbp(total)}</b>
            <small>{gbp(ANNUAL)}/yr + {gbp(resourceTotal)} resources</small>
          </div>
        </aside>

        <main className={styles.panel}>
          {step === 0 && (
            <div className={styles.screen}>
              <h2>Set up your organisation</h2>
              <p className={styles.lead}>Tell us who you are. This takes about a minute, and nothing here needs a call with us.</p>
              <label className={styles.lbl}>Organisation name</label>
              <input className={styles.field} value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} placeholder="e.g. Sussex Imaging" />
              <div className={styles.two}>
                <div>
                  <label className={styles.lbl}>Type of setting</label>
                  <select className={styles.field} value={org.type} onChange={(e) => setOrg({ ...org, type: e.target.value })}>
                    <option value="">Choose…</option>
                    {SETTINGS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.lbl}>Number of sites</label>
                  <input className={styles.field} type="number" min={1} value={org.sites} onChange={(e) => setOrg({ ...org, sites: Math.max(1, Number(e.target.value)) })} />
                </div>
              </div>
              <label className={styles.lbl}>Admin email</label>
              <input className={styles.field} type="email" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} placeholder="you@trust.nhs.uk" />
              <div className={styles.actions}>
                <span />
                <button className={styles.primary} disabled={!step0Valid} onClick={next}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.screen}>
              <h2>Choose what you capture</h2>
              <p className={styles.lead}>Pick the instruments that fit your pathways. You can add more later, and each one fires at the right point automatically.</p>
              <div className={styles.opts}>
                {INSTRUMENTS.map((ins) => (
                  <button key={ins.id} className={styles.opt} data-on={chosen.has(ins.id)} onClick={() => toggle(ins.id)}>
                    <span className={styles.optCheck}>{chosen.has(ins.id) ? '✓' : ''}</span>
                    <span>
                      <b>{ins.name}</b>
                      <em>{ins.note}</em>
                    </span>
                    <span className={styles.optKind} data-kind={ins.kind}>
                      {ins.kind}
                    </span>
                  </button>
                ))}
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

          {step === 2 && (
            <div className={styles.screen}>
              <h2>Order your materials</h2>
              <p className={styles.lead}>Everything patients scan or tap, shipped to each site. Digital assets are included and live the same day. Priced at cost, never per-scan.</p>
              <div className={styles.shop}>
                {CATEGORIES.map((cat) => (
                  <div key={cat.key} className={styles.catGroup}>
                    <div className={styles.catHead}>
                      <h3>{cat.label}</h3>
                      <p>{cat.note}</p>
                    </div>
                    {resourcesByCategory(cat.key).map((r) => (
                      <div key={r.id} className={styles.res}>
                        <div className={styles.resIcon} aria-hidden="true"><Icon name={r.icon} size={22} /></div>
                        <div className={styles.resBody}>
                          <b>{r.name}{r.unit ? <span className={styles.resUnit}> · {r.unit}</span> : null}</b>
                          <em>{r.desc}</em>
                          <span className={styles.resEg}>{r.example}</span>
                        </div>
                        <div className={styles.resRight}>
                          <span className={styles.price} data-free={r.price === 0}>{priceLabel(r)}</span>
                          {r.category === 'digital' ? (
                            <button
                              className={styles.toggle}
                              data-on={(cart[r.id] || 0) > 0}
                              onClick={() => setQty(r.id, (cart[r.id] || 0) > 0 ? 0 : 1)}
                            >
                              {(cart[r.id] || 0) > 0 ? 'Added' : 'Add'}
                            </button>
                          ) : (
                            <div className={styles.qty}>
                              <button aria-label={`Fewer ${r.name}`} onClick={() => setQty(r.id, (cart[r.id] || 0) - 1)}>−</button>
                              <span>{cart[r.id] || 0}</span>
                              <button aria-label={`More ${r.name}`} onClick={() => setQty(r.id, (cart[r.id] || 0) + 1)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className={styles.resTotal}>
                Materials subtotal <b>{gbp(resourceTotal)}</b>
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

          {step === 3 && (
            <div className={styles.screen}>
              <h2>Review &amp; pay</h2>
              <p className={styles.lead}>A single £100 annual fee, plus any resources you ordered. Cancel anytime.</p>
              <div className={styles.summary}>
                <div className={styles.sumRow}>
                  <span>Straight Talking annual fee ({org.sites} {org.sites === 1 ? 'site' : 'sites'})</span>
                  <b>{gbp(ANNUAL)}/yr</b>
                </div>
                {RESOURCES.filter((r) => (cart[r.id] || 0) > 0).map((r) => (
                  <div key={r.id} className={styles.sumRow}>
                    <span>
                      {r.name}{r.category === 'digital' ? '' : ` × ${cart[r.id]}`}
                    </span>
                    <b>{r.price === 0 ? 'Included' : gbp(r.price * cart[r.id])}</b>
                  </div>
                ))}
                <div className={styles.sumTotal}>
                  <span>Due today</span>
                  <b>{gbp(total)}</b>
                </div>
              </div>
              <div className={styles.secure}>
                <Icon name="lock" size={17} />
                <span>Payment is handled by our PCI-compliant provider. We never see or store your card details. This preview skips the card step.</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <button className={styles.primary} onClick={next}>
                  Pay &amp; continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.screen}>
              <h2>Add your details</h2>
              <p className={styles.lead}>The last touches, so feedback routes to the right places from the first scan.</p>
              <label className={styles.lbl}>Public display name (on the board and app)</label>
              <input className={styles.field} value={details.display} onChange={(e) => setDetails({ ...details, display: e.target.value })} placeholder={org.name || 'Your clinic'} />
              <label className={styles.lbl}>Google review link (for praise)</label>
              <input className={styles.field} value={details.reviewUrl} onChange={(e) => setDetails({ ...details, reviewUrl: e.target.value })} placeholder="https://g.page/r/…" />
              <label className={styles.lbl}>Route concerns to</label>
              <select className={styles.field} value={details.governance} onChange={(e) => setDetails({ ...details, governance: e.target.value })}>
                <option>Datix</option>
                <option>Radar Healthcare</option>
                <option>Email to governance lead</option>
              </select>
              <div className={styles.actions}>
                <button className={styles.back} onClick={back}>
                  ← Back
                </button>
                <button className={styles.primary} onClick={next}>
                  Go live
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.screen}>
              <div className={styles.liveHead}>
                <div className={styles.liveMark}>✓</div>
                <div>
                  <h2>{details.display || org.name || 'Your clinic'} is live.</h2>
                  <p className={styles.lead}>Your codes are active. Every scan goes straight to leave feedback, no login, no app.</p>
                </div>
              </div>
              <div className={styles.liveGrid}>
                <div className={styles.qrCard}>
                  <QRCode value={`https://${liveUrl}`} size={160} title="Your live feedback QR code" />
                  <div className={styles.qrCap}>Your live feedback code</div>
                  <div className={styles.qrLink}>{liveUrl}</div>
                </div>
                <div className={styles.guide}>
                  <button className={styles.guideHead} onClick={() => setGuideOpen((v) => !v)}>
                    How to set up your screens {guideOpen ? '▾' : '▸'}
                  </button>
                  {guideOpen && (
                    <ol className={styles.guideList}>
                      <li>Stand your QR cards on reception and clinic desks, and put the A2 poster where patients wait.</li>
                      <li>On any waiting-room screen or spare display, open a browser to your board link (in the welcome email) and press full-screen (F11). It runs itself, no software to install.</li>
                      <li>For a permanent display, use the screen’s built-in browser or a cheap media stick set to the board link on boot.</li>
                      <li>Set the screen to never sleep. That’s it, it updates itself.</li>
                    </ol>
                  )}
                  <div className={styles.liveActions}>
                    <Button variant="teal" as="a" href="/feedback">
                      Open the feedback form
                    </Button>
                    <Button variant="ghost" as="a" href="/board">
                      Preview your board
                    </Button>
                  </div>
                </div>
              </div>
              <div className={styles.liveNote}>
                A welcome email is on its way to <b>{org.email || 'your admin address'}</b> with your board link, printable codes and login. Nothing else needed from us. Need more stands or cards later? <a href="/reorder">Reorder anytime</a>, your plan stays as it is.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
