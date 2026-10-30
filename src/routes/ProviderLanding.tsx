import { Logo } from '@/components/brand/Logo'
import { ProductBy } from '@/components/brand/ProductBy'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Sparkline } from '@/components/charts/Sparkline'
import { CATEGORIES, resourcesByCategory, priceLabel } from '@/data/resources'
import { reopenConsent } from '@/lib/consent'
import { useReveal } from '@/lib/hooks/useReveal'
import { useCountUp } from '@/lib/hooks/useCountUp'
import styles from './ProviderLanding.module.css'

const SURFACES: { href: string; icon: IconName; title: string; note: string }[] = [
  { href: '/feedback', icon: 'star', title: 'The patient app', note: 'How patients leave feedback: rate a visit, say it in their words, route it.' },
  { href: '/support', icon: 'heart', title: 'Peer support', note: 'An anonymous space where patients support one another.' },
  { href: '/dashboard', icon: 'trend', title: 'Clinician dashboard', note: 'Capture rate and sentiment across every site, on live sample data.' },
  { href: '/board', icon: 'monitor', title: 'Waiting-room board', note: 'In-clinic display of real patient voices. Best full-screen.' },
  { href: '/setup', icon: 'qr', title: 'Set up your clinic', note: 'Self-serve onboarding: configure, order materials, go live in a day.' },
]

const PILLARS = [
  {
    tag: 'CAPTURE',
    title: 'Get the feedback others miss',
    body: 'A one-tap, no-login way for patients to tell you how a visit really felt, at the point of care. Capture rates a review site cannot touch, from the people who usually stay quiet.',
    points: ['QR, SMS and in-clinic', 'Under a minute, anonymous by default', 'A kind word, a worry, or a quiet thought'],
  },
  {
    tag: 'ROUTE',
    title: 'Every voice to the right place',
    body: 'Concerns reach the practice team the same day, happy patients are offered a one-tap public review, and every comment is read by the people who actually run the service.',
    points: ['Concerns flagged to the team', 'Praise to a public review in one tap', 'Themes and trends surfaced'],
  },
  {
    tag: 'SUPPORT',
    title: 'A space for patients to help patients',
    body: 'An anonymous peer-support space where people share how they are feeling, ask the questions they did not get to ask, and hear from others who have been where they are. Kind, moderated, and safe.',
    points: ['Anonymous posts and replies', 'Supportive, moderated, never clinical', 'Urgent-help signposting built in'],
  },
]

const AUDIENCE: { icon: IconName; title: string; body: string }[] = [
  { icon: 'building', title: 'Independent providers', body: 'Hear honest feedback across every site with a signal you own, not one scattered across review platforms, and act on concerns before they become complaints.' },
  { icon: 'network', title: 'ICBs & systems', body: 'A consistent patient-voice layer across a place, filling the gap left as Healthwatch winds down and the NHS ranks providers on experience.' },
  { icon: 'heart', title: 'Practice & patient teams', body: 'Concerns in front of the right people the same day, themes you can act on, and a supportive space patients actually want to use.' },
]

const STEPS = [
  { no: '01', title: 'Patient scans', body: 'A code in the clinic, on the letter, or by text. No app, no login.' },
  { no: '02', title: 'They say it straight', body: 'A rating and a few words. A compliment, a concern, or a quiet thought.' },
  { no: '03', title: 'It reaches the team', body: 'Concerns flag to the practice team the same day; praise lifts your public rating.' },
  { no: '04', title: 'Patients support patients', body: 'An anonymous space where people going through the same thing help each other.' },
]

export function ProviderLanding() {
  const cap = useCountUp(92, { start: true })
  const vol = useCountUp(94, { start: true })
  const hrs = useCountUp(6, { start: true })
  const gauge = useReveal<HTMLDivElement>()

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Logo variant="colour" height={30} />
          <div className={styles.navRight}>
            <a href="#how">How it works</a>
            <a href="#materials">Materials</a>
            <a href="#see">See it working</a>
            <Button variant="teal" as="a" href="#book">
              Book a demo
            </Button>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroField}>
          <Sparkline values={[30, 40, 36, 52, 48, 62, 70, 66, 80, 88, 96, 108]} colour="#13a093" fill height={220} />
        </div>
        <div className={styles.heroInner}>
          <h1>
            Hear what patients really think.<br />
            And let them <span className={styles.em}>help each other</span>.
          </h1>
          <p className={styles.lead}>One simple place to capture honest feedback at the point of care, get concerns to the right people fast, and give patients an anonymous space to support one another.</p>
          <div className={styles.ctaRow}>
            <Button variant="teal" size="lg" as="a" href="#book">
              Book a demo
            </Button>
            <Button variant="ghost" size="lg" as="a" href="/feedback">
              See the patient app
            </Button>
          </div>
          <div className={styles.stats}>
            <div>
              <div className={styles.sn} ref={cap.ref as never}>
                {cap.value}%
              </div>
              <div className={styles.sl}>of patients leave feedback when asked</div>
            </div>
            <div>
              <div className={styles.sn} ref={vol.ref as never}>
                {vol.value}%
              </div>
              <div className={styles.sl}>would recommend their practice</div>
            </div>
            <div>
              <div className={styles.sn}><span ref={hrs.ref as never}>{hrs.value}</span>h</div>
              <div className={styles.sl}>median to first action on a concern</div>
            </div>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: '0.78rem', color: 'var(--st-slate)', maxWidth: '54ch' }}>
            Illustrative figures — the outcomes Straight Talking is built to deliver, not a record of past results.
          </p>
        </div>
      </header>

      <section id="why" className={styles.why}>
        <Reveal className={styles.eyebrow}>WHY NOW</Reveal>
        <Reveal el="h2" className={styles.h2}>
          A patient-voice vacuum is opening.
        </Reveal>
        <Reveal className={styles.whyGrid}>
          <p>
            As Healthwatch winds down and local scrutiny folds into the system, the structured way patients fed back on their care is disappearing, just as the NHS starts ranking providers on experience. Providers keep the duty to listen, without the infrastructure to do it.
          </p>
          <p>
            Straight Talking fills that gap simply: capture honest feedback at the point of care, get concerns to the practice team the same day, surface the themes that matter, and give patients an anonymous space to support each other.
          </p>
        </Reveal>
      </section>

      <section id="what" className={styles.section}>
        <Reveal className={styles.eyebrow}>CAPTURE. ROUTE. SUPPORT.</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Everything the patient voice needs, in one place.
        </Reveal>
        <div className={styles.pillars}>
          {PILLARS.map((p) => (
            <Reveal key={p.tag} className={styles.pillar}>
              <span className={styles.ptag}>{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
              <ul>
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.gaugeBand}>
        <div className={styles.gaugeInner}>
          <div>
            <Reveal className={styles.eyebrow}>THE NUMBER THAT MOVES EVERYTHING</Reveal>
            <Reveal el="h2" className={styles.h2Left}>
              Capture rate is the whole game.
            </Reveal>
            <Reveal className={styles.gaugeCopy}>
              Most feedback tools hear from the loudest few percent, so what you see isn’t what most patients feel. Straight Talking lifts the share who actually respond, so the picture you act on is the real one, representative enough to trust.
            </Reveal>
          </div>
          <div className={`${styles.gauge} reveal`} ref={gauge}>
            <div className={styles.gaugeNum}>92%</div>
            <div className={styles.gaugeLab}>the capture rate we’re built to reach</div>
            <div className={styles.gaugeTrack}>
              <span style={{ width: '92%' }} />
            </div>
            <div className={styles.gaugeCompare}>
              <span>Typical review capture ~4%</span>
              <span>Straight Talking 92%</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <Reveal className={styles.eyebrow}>WHO IT'S FOR</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Built for the people who carry the duty to listen.
        </Reveal>
        <div className={styles.audience}>
          {AUDIENCE.map((a) => (
            <Reveal key={a.title} className={styles.aud}>
              <div className={styles.audIc}><Icon name={a.icon} size={26} /></div>
              <h4>{a.title}</h4>
              <p>{a.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className={styles.section}>
        <Reveal className={styles.eyebrow}>HOW IT WORKS</Reveal>
        <Reveal el="h2" className={styles.h2}>
          From a scan to a supported patient.
        </Reveal>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <Reveal key={s.no} className={styles.stepc}>
              <div className={styles.stepNo}>{s.no}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="materials" className={styles.section}>
        <Reveal className={styles.eyebrow}>WHAT YOU CAN ORDER</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Materials that get people scanning.
        </Reveal>
        <Reveal className={styles.matIntro}>
          Printed, digital and tap-to-open. Every format carries your QR to leave feedback, priced at cost, with the digital assets included and live the same day.
        </Reveal>
        <div className={styles.matGroups}>
          {CATEGORIES.map((cat) => (
            <Reveal key={cat.key} className={styles.matGroup}>
              <div className={styles.matGroupHead}>
                <h3>{cat.label}</h3>
                <p>{cat.note}</p>
              </div>
              <div className={styles.matGrid}>
                {resourcesByCategory(cat.key).map((r) => (
                  <div key={r.id} className={styles.matCard}>
                    <span className={styles.matIc}><Icon name={r.icon} size={22} /></span>
                    <div className={styles.matBody}>
                      <b>{r.name}</b>
                      <em>{r.desc}</em>
                    </div>
                    <span className={styles.matPrice} data-free={r.price === 0}>{priceLabel(r)}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className={styles.matFoot}>
          A flat £200 a year covers the platform. Materials are the only extras, and you top them up whenever you need to.
        </Reveal>
      </section>

      <section id="see" className={styles.section}>
        <Reveal className={styles.eyebrow}>SEE IT WORKING</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Every surface, in one place.
        </Reveal>
        <Reveal className={styles.matIntro}>
          The same product from every angle. Open any of them, they run on live sample data.
        </Reveal>
        <div className={styles.surfaces}>
          {SURFACES.map((s) => (
            <Reveal key={s.href} className={styles.surfaceWrap}>
              <a className={styles.surface} href={s.href}>
                <span className={styles.surfaceIc}><Icon name={s.icon} size={22} /></span>
                <span className={styles.surfaceBody}>
                  <b>{s.title}</b>
                  <em>{s.note}</em>
                </span>
                <span className={styles.surfaceGo} aria-hidden="true">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="book" className={styles.cta}>
        <Reveal className={styles.ctaInner}>
          <h2>Give every patient a straight line to you.</h2>
          <p>See a live walkthrough on your own sites and services. No slides, just the platform.</p>
          <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
            <Button variant="teal" size="lg" as="a" href="mailto:hello@straighttalking.org.uk">
              Book a demo
            </Button>
            <Button variant="ghost" size="lg" as="a" href="/support">
              See peer support
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footTop}>
          <div className={styles.footBrand}>
            <Logo variant="colour" height={28} />
            <p>Say it straight. We're listening.</p>
            <p className={styles.footMuted}>The independent home for the patient voice.</p>
          </div>
          <div className={styles.footCols}>
            <div>
              <h5>Platform</h5>
              <a href="#how">How it works</a>
              <a href="/feedback">Patient app</a>
              <a href="/support">Peer support</a>
              <a href="/board">Clinic board</a>
              <a href="#book">Pricing</a>
            </div>
            <div>
              <h5>Get started</h5>
              <a href="/setup">Set up your clinic</a>
              <a href="/setup">Order resources</a>
              <a href="/setup">Go live in a day</a>
              <a href="#book">Book a demo</a>
            </div>
            <div>
              <h5>Data &amp; security</h5>
              <a href="/privacy">How we manage data</a>
              <a href="/privacy">What data we hold</a>
              <a href="/privacy">UK GDPR &amp; lawful basis</a>
              <a href="/privacy">Where data is stored</a>
              <a href="/privacy">Sub-processors</a>
              <a href="/privacy">Security &amp; certifications</a>
            </div>
            <div>
              <h5>Company</h5>
              <a href="#book">Contact</a>
              <a href="/privacy">Privacy policy</a>
              <button type="button" className={styles.linkBtn} onClick={() => reopenConsent()}>
                Cookie preferences
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footBase}>
          <span>© 2026 Straight Talking. An independent patient feedback platform.</span>
          <ProductBy />
          <span>No patient identifiable data is held against feedback.</span>
        </div>
      </footer>
    </div>
  )
}

function Reveal({
  children,
  className,
  el = 'div',
}: {
  children: React.ReactNode
  className?: string
  el?: 'div' | 'h2'
}) {
  const ref = useReveal<HTMLDivElement>()
  const cls = `reveal ${className ?? ''}`
  if (el === 'h2')
    return (
      <h2 ref={ref as never} className={cls}>
        {children}
      </h2>
    )
  return (
    <div ref={ref} className={cls}>
      {children}
    </div>
  )
}
