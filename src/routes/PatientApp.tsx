import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { FeedbackFlow } from '@/features/patient/FeedbackFlow'
import { useReveal } from '@/lib/hooks/useReveal'
import { LANGS, T } from '@/i18n/patient'
import styles from './PatientApp.module.css'

const MARQUEE = [
  'The radiographer completely settled my nerves.',
  'Booked, scanned and out in half an hour.',
  'Someone finally listened.',
  'Kind, calm and quick.',
  'Wait was long but staff were lovely.',
  'Felt genuinely cared for.',
  'The calmest MRI I have had.',
  'Easy to say what I actually thought.',
]

const STEPS: { no: string; icon: IconName; title: string; body: string }[] = [
  { no: 'STEP 01', icon: 'star', title: 'Rate your visit', body: 'Pick where we saw you and how it felt. One tap is enough to start.' },
  { no: 'STEP 02', icon: 'pencil', title: 'Say what you like', body: 'Praise, a concern, or a passing thought. As much or as little as you want.' },
  { no: 'STEP 03', icon: 'check', title: 'It reaches the team', body: 'Concerns land with the care team the same day. Nothing gets lost in a form.' },
]

const ROUTES = [
  { cls: 'pos', tag: 'PRAISE', title: 'Offered to Google', body: 'Happy visits get a one-tap public review, so the next anxious patient feels safe choosing us. Always your choice.' },
  { cls: 'con', tag: 'CONCERN', title: 'Logged in Datix / Radar', body: 'Concerns become governance records the clinical team reviews and acts on. Tracked, never buried.' },
  { cls: 'com', tag: 'ANY THOUGHT', title: 'Read by the site', body: 'Every comment is read by the people who run the service. Small things become better visits.' },
]

export function PatientApp() {
  const [flowOpen, setFlowOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState(14206)
  const [lang, setLang] = useState('en')
  const t = T[lang]
  const rtl = LANGS.find((l) => l.code === lang)?.rtl ?? false

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    const tick = window.setInterval(() => Math.random() < 0.5 && setCount((c) => c + 1), 2400)
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearInterval(tick)
    }
  }, [])

  return (
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <nav className={styles.nav} data-scrolled={scrolled}>
        <div className={styles.navInner}>
          <Logo height={32} />
          <div className={styles.navRight}>
            <label className={styles.langWrap}>
              <span className={styles.globe} aria-hidden="true"><Icon name="globe" size={16} /></span>
              <select className={styles.lang} value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language">
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="teal" onClick={() => setFlowOpen(true)}>
              {t.sayItStraight}
            </Button>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>
            {t.titlePre} <span className={styles.em}>{t.titleEm}</span>
          </h1>
          <p className={styles.lead}>{t.lead}</p>
          <div className={styles.ctaRow}>
            <Button variant="teal" size="lg" onClick={() => setFlowOpen(true)}>
              {t.share}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => document.getElementById('how')?.scrollIntoView()}>
              {t.how}
            </Button>
          </div>
          <div className={styles.counter}>
            <span className={styles.avatars}>
              <i /><i /><i /><i />
            </span>
            <div>
              <b>{count.toLocaleString('en-GB')}</b> <em>{t.counter}</em>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.marq}>
        <div className={styles.track}>
          {[...MARQUEE, ...MARQUEE].map((q, i) => (
            <span key={i} className={styles.qchip}>
              “{q}”
            </span>
          ))}
        </div>
      </div>

      <section id="how" className={styles.section}>
        <Reveal className={styles.eyebrow}>HOW IT WORKS</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Three taps, and you are heard.
        </Reveal>
        <Reveal className={styles.subline}>No account, no name, no NHS number. Just your experience, in your own words.</Reveal>
        <div className={styles.steps}>
          {STEPS.map((s) => (
            <Reveal key={s.no} className={styles.step}>
              <div className={styles.stepNo}>{s.no}</div>
              <div className={styles.stepIc}><Icon name={s.icon} size={24} /></div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.sectionTight}>
        <Reveal className={styles.band}>
          <div className={styles.bandBig}>
            Not sure your opinion counts? <em>It does.</em>
          </div>
          <p>After an appointment you might feel unsure, or unclear who to talk to. That is exactly why we exist: one honest, private place, whatever you want to say.</p>
          <div className={styles.bstats}>
            <div>
              <div className={styles.bn}>60s</div>
              <div className={styles.bl}>to have your say, on average</div>
            </div>
            <div>
              <div className={styles.bn}>0</div>
              <div className={styles.bl}>personal details stored</div>
            </div>
            <div>
              <div className={styles.bn}>94%</div>
              <div className={styles.bl}>of concerns actioned same day</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className={styles.sectionTight}>
        <Reveal className={styles.eyebrow}>WHERE YOUR WORDS GO</Reveal>
        <Reveal el="h2" className={styles.h2}>
          Honest about the route they take.
        </Reveal>
        <Reveal className={styles.subline}>You are saved as a private reference and a service, never a name. Here is exactly what happens next.</Reveal>
        <div className={styles.routes}>
          {ROUTES.map((r) => (
            <Reveal key={r.tag} className={`${styles.rcard} ${styles[r.cls as 'pos' | 'con' | 'com']}`}>
              <span className={styles.rtag}>{r.tag}</span>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Reveal className={styles.final}>
          <h2 className={styles.h2}>Your visit. Your words.</h2>
          <p className={styles.subline}>It takes about a minute, and it genuinely helps the next person through the door.</p>
          <div className={styles.ctaRow} style={{ justifyContent: 'center' }}>
            <Button variant="teal" size="lg" onClick={() => setFlowOpen(true)}>
              Say it straight
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <Logo height={26} />
        <span>No patient identifiable data is held against feedback.</span>
      </footer>

      <FeedbackFlow open={flowOpen} onClose={() => setFlowOpen(false)} />
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
  if (el === 'h2') return <h2 ref={ref as never} className={cls}>{children}</h2>
  return (
    <div ref={ref} className={cls}>
      {children}
    </div>
  )
}
