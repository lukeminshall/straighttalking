import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Sparkline } from '@/components/charts/Sparkline'
import { CATEGORIES, resourcesByCategory, priceLabel } from '@/data/resources'
import { useReveal } from '@/lib/hooks/useReveal'
import { useCountUp } from '@/lib/hooks/useCountUp'
import styles from './ProviderLanding.module.css'

const SURFACES: { href: string; icon: IconName; title: string; note: string }[] = [
  { href: '/feedback', icon: 'star', title: 'The patient app', note: 'How patients leave feedback: rate a visit, say it in their words, route it.' },
  { href: '/app', icon: 'trend', title: 'Operator dashboard', note: 'Live capture rate and sentiment across every site.' },
  { href: '/outcomes', icon: 'check', title: 'Outcomes & value', note: 'PROMs health gain, the value map and PHIN readiness.' },
  { href: '/board', icon: 'monitor', title: 'Waiting-room board', note: 'In-clinic display of real patient voices. Best full-screen.' },
  { href: '/setup', icon: 'qr', title: 'Set up your clinic', note: 'Self-serve onboarding: configure, order materials, go live in a day.' },
]

const PILLARS = [
  {
    tag: 'CAPTURE',
    title: 'Every voice, across the whole journey',
    body: 'One low-friction capture layer from referral to outcome. The instruments the system mandates, fired by pathway and timepoint, at capture rates the incumbents cannot touch.',
    points: ['FFT, PROMs, PREMs, QPROMs', 'QR, SMS, kiosk, in-clinic', 'Anonymous by default, linkable on consent'],
  },
  {
    tag: 'COMPLY',
    title: 'Submission-ready, not another spreadsheet',
    body: 'Concerns routed to governance, praise to public review, and the mandated datasets prepared in the formats PHIN, NHS Digital and the registries expect. One spine instead of four tools.',
    points: ['PHIN & NHS Digital PROMs exports', 'Datix / Radar governance routing', 'Pre and post PROM pairing'],
  },
  {
    tag: 'PROVE VALUE',
    title: 'Turn outcomes into value',
    body: 'Link the before and after to measure real health gain, case-mix adjust it, benchmark by site and consultant, and pair it with cost. The numerator of value-based care, made routine.',
    points: ['Case-mix-adjusted health gain', 'Site and consultant benchmarking', 'The data for outcome-linked contracts'],
  },
]

const AUDIENCE: { icon: IconName; title: string; body: string }[] = [
  { icon: 'building', title: 'Independent providers', body: 'Meet the June 2026 CMA and PHIN obligations with a capture layer you own, and compete on proven quality rather than price alone.' },
  { icon: 'network', title: 'ICBs & systems', body: 'A consistent patient-reported layer across a place, filling the gap left as Healthwatch winds down and the NHS ranks on experience.' },
  { icon: 'trend', title: 'Value-based care leads', body: 'The outcomes numerator, pathway by pathway, ready to pair with cost for benchmarking and outcome-linked contracting.' },
]

const STEPS = [
  { no: '01', title: 'Capture across the journey', body: 'Referral, diagnosis, treatment and outcome. The right instrument fires at the right moment.' },
  { no: '02', title: 'Route and comply', body: 'Concerns to governance, praise to public, datasets prepared for PHIN and NHS Digital.' },
  { no: '03', title: 'Measure the gain', body: 'Pre and post questionnaires linked into a real, case-mix-adjusted health gain.' },
  { no: '04', title: 'Prove the value', body: 'Benchmark outcomes against cost, by site and consultant, ready for contracting.' },
]

export function ProviderLanding() {
  const cap = useCountUp(92, { start: true })
  const vol = useCountUp(74, { start: true })
  const hrs = useCountUp(12, { start: true })
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
            From referral to outcome.<br />
            The patient voice, <span className={styles.em}>and its value</span>.
          </h1>
          <p className={styles.lead}>One capture layer for the whole clinical journey. Every mandated instrument, FFT to PROMs, on a single spine, prepared for PHIN and turned into the health gain that proves value-based care.</p>
          <div className={styles.ctaRow}>
            <Button variant="teal" size="lg" as="a" href="#book">
              Book a demo
            </Button>
            <Button variant="ghost" size="lg" as="a" href="/outcomes">
              See the outcomes view
            </Button>
          </div>
          <div className={styles.stats}>
            <div>
              <div className={styles.sn} ref={cap.ref as never}>
                {cap.value}%
              </div>
              <div className={styles.sl}>capture rate at leading sites</div>
            </div>
            <div>
              <div className={styles.sn} ref={vol.ref as never}>
                {vol.value}%
              </div>
              <div className={styles.sl}>PROMs pre and post pairing rate</div>
            </div>
            <div>
              <div className={styles.sn}>+<span ref={hrs.ref as never}>{hrs.value}</span>%</div>
              <div className={styles.sl}>health gain above national benchmark</div>
            </div>
          </div>
        </div>
      </header>

      <section id="why" className={styles.why}>
        <Reveal className={styles.eyebrow}>WHY NOW</Reveal>
        <Reveal el="h2" className={styles.h2}>
          A patient-voice vacuum is opening.
        </Reveal>
        <Reveal className={styles.whyGrid}>
          <p>
            As Healthwatch winds down and local scrutiny folds into the system, the structured route for patient voice is disappearing, just as PHIN drives to full CMA compliance by June 2026 and the NHS starts ranking providers on experience. The duties are rising; the infrastructure is not.
          </p>
          <p>
            Straight Talking fills that gap on one spine: capture across the journey, route concerns into governance, prepare the mandated datasets for PHIN and NHS Digital, and turn paired outcomes into the health gain that proves value.
          </p>
        </Reveal>
      </section>

      <section id="what" className={styles.section}>
        <Reveal className={styles.eyebrow}>CAPTURE. COMPLY. PROVE VALUE.</Reveal>
        <Reveal el="h2" className={styles.h2}>
          One spine, the whole journey.
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
              Most tools hear from the loudest few percent, which is fatal for outcomes: an unrepresentative PROM cannot be defended or benchmarked. Straight Talking lifts the share who actually respond, so the health-gain data underneath value-based care holds up.
            </Reveal>
          </div>
          <div className={`${styles.gauge} reveal`} ref={gauge}>
            <div className={styles.gaugeNum}>92%</div>
            <div className={styles.gaugeLab}>of eligible visits leave feedback</div>
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
          From referral to proven value.
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
          Every surface, on one spine.
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
          <h2>The patient voice, from front door to outcome.</h2>
          <p>See a live walkthrough on your own pathways and instruments. No slides, just the platform.</p>
          <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
            <Button variant="teal" size="lg" as="a" href="mailto:hello@straighttalking.co.uk">
              Book a demo
            </Button>
            <Button variant="ghost" size="lg" as="a" href="/outcomes">
              See the outcomes view
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footTop}>
          <div className={styles.footBrand}>
            <Logo variant="colour" height={28} />
            <p>Say it straight. We're listening.</p>
            <p className={styles.footMuted}>The patient-reported spine of the clinical journey.</p>
          </div>
          <div className={styles.footCols}>
            <div>
              <h5>Platform</h5>
              <a href="#how">How it works</a>
              <a href="/outcomes">Outcomes &amp; value</a>
              <a href="#what">Instruments</a>
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
              <a href="#data">How we manage data</a>
              <a href="#data">What data we hold</a>
              <a href="#data">UK GDPR &amp; lawful basis</a>
              <a href="#data">Where data is stored</a>
              <a href="#data">Sub-processors</a>
              <a href="#data">Security &amp; certifications</a>
            </div>
            <div>
              <h5>Company</h5>
              <a href="#book">Contact</a>
              <a href="#data">Privacy policy</a>
              <a href="#data">Terms of service</a>
              <a href="#data">Cookie preferences</a>
              <a href="#data">Accessibility</a>
            </div>
          </div>
        </div>
        <div className={styles.footBase}>
          <span>© 2026 Straight Talking. An independent patient feedback platform.</span>
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
