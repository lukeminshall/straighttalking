import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { youSaidWeDid, type BoardVoice } from '@/data/board'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { useDemo } from '@/demo/DemoContext'
import { stars } from '@/lib/format'
import { QRCode } from '@/components/brand/QRCode'
import styles from './ClinicBoard.module.css'

const VOICE_MS = 5000
const YSD_MS = 6000

export interface BoardProps {
  /** Live published voices; falls back to the demo seed when empty/absent. */
  voices?: BoardVoice[]
  /** Live you-said-we-did pairs; falls back to the demo seed when empty. */
  saidDid?: { said: string; did: string }[]
  clinicName?: string
  town?: string
  formUrl?: string
}

export function ClinicBoard({ voices: liveVoices, saidDid, clinicName, town, formUrl }: BoardProps = {}) {
  const demo = useDemo()
  const voices = liveVoices && liveVoices.length ? liveVoices : demo.boardVoices
  const ysdList = saidDid && saidDid.length ? saidDid : youSaidWeDid
  const name = clinicName || 'Sussex Imaging'
  const place = town || 'Haywards Heath'
  const formTarget = formUrl || 'https://straighttalking.org.uk/f/sussex-imaging'
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [ysdIndex, setYsdIndex] = useState(0)
  const [shared, setShared] = useState(1204)
  const [clock, setClock] = useState(formatClock())

  const rec = useCountUp(94, { start: true })
  const avg = useCountUp(4.8, { decimals: 1, start: true })

  useEffect(() => {
    const v = window.setInterval(() => setVoiceIndex((i) => i + 1), VOICE_MS)
    const y = window.setInterval(() => setYsdIndex((i) => (i + 1) % ysdList.length), YSD_MS)
    const tick = window.setInterval(() => {
      if (Math.random() < 0.6) setShared((s) => s + 1)
    }, 7000)
    const c = window.setInterval(() => setClock(formatClock()), 10000)
    return () => {
      clearInterval(v)
      clearInterval(y)
      clearInterval(tick)
      clearInterval(c)
    }
  }, [])

  const voice = voices[voiceIndex % voices.length]
  const ysd = ysdList[ysdIndex % ysdList.length]

  return (
    <div className={styles.board}>
      <header className={styles.top}>
        <Logo height={34} />
        <div className={styles.clinic}>
          <div className={styles.name}>{name}</div>
          <div className={styles.sub}>{place} · what our patients are telling us</div>
        </div>
        <div className={styles.cqc}>
          <span className={styles.rate}>Good</span>
          <div className={styles.cqcLabel}>
            <b>CQC rated</b>
            Caring: Outstanding
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.voices}`}>
          <div className={styles.kick}>
            <span className={styles.blip} />
            IN OUR PATIENTS' OWN WORDS
          </div>
          <div className={styles.voice} key={voiceIndex}>
            <div className={styles.quote}>
              <span>{voice.quote}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.qStars}>{stars(voice.rating)}</span>
              <span className={styles.qTag}>
                <b>{voice.service}</b> · {voice.when}
              </span>
            </div>
          </div>
          <div className={styles.dots}>
            {voices.map((_, i) => (
              <i key={i} data-on={i === voiceIndex % voices.length} />
            ))}
          </div>
        </section>

        <section className={`${styles.card} ${styles.ysd}`} key={ysdIndex}>
          <div className={styles.ysdBadge}>
            You said, <em>we did.</em>
          </div>
          <div className={styles.pair}>
            <div className={styles.said}>
              <div className={styles.h}>YOU SAID</div>
              <div className={styles.t}>{ysd.said}</div>
            </div>
            <div className={styles.arrow}>→</div>
            <div className={styles.did}>
              <div className={styles.h}>WE DID</div>
              <div className={styles.t}>{ysd.did}</div>
            </div>
          </div>
        </section>

        <aside className={styles.right}>
          <div className={`${styles.card} ${styles.stat}`}>
            <div className={styles.statN}>{shared.toLocaleString('en-GB')}</div>
            <div className={styles.statL}>patients shared their visit here this month</div>
            <div className={styles.row2}>
              <div>
                <div className={styles.b} ref={rec.ref as never}>
                  {rec.value}%
                </div>
                <div className={styles.s}>would recommend us</div>
              </div>
              <div>
                <div className={styles.b} ref={avg.ref as never}>
                  {avg.value}★
                </div>
                <div className={styles.s}>average this week</div>
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.qr}`}>
            <h3>
              Share your thoughts. Help the <em>next patient</em> on their journey.
            </h3>
            <div className={styles.qrBox}>
              <QRCode value={formTarget} size={200} dark="#14312d" title="Scan to share your visit" />
            </div>
            <div className={styles.how}>Scan with your phone camera</div>
            <div className={styles.chips}>
              <span>Takes a minute</span>
              <span>Stays anonymous</span>
              <span>No sign-in</span>
            </div>
          </div>
        </aside>
      </div>

      <footer className={styles.foot}>
        <div className={styles.live}>
          <span className={styles.blip} />
          Live feedback · updated continuously
        </div>
        <div>An independent patient feedback platform · {clock}</div>
      </footer>
    </div>
  )
}

function formatClock(): string {
  const d = new Date()
  return (
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}
