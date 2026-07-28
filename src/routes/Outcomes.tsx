import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { pathways, instruments, journey, outcomeSummary as sum, type Pathway } from '@/data/outcomes'
import { gb } from '@/lib/format'
import styles from './Outcomes.module.css'

const valueColour = (v: number) => (v >= 70 ? '#0e857d' : v >= 50 ? '#e0a13c' : '#f76f5c')

export function Outcomes() {
  const [mounted, setMounted] = useState(false)
  const gain = useCountUp(sum.healthGainVsNational, { start: true })
  const pairing = useCountUp(sum.pairingRate, { start: true })

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.brand}>
            <Logo variant="colour" height={30} />
          </div>
          <span className={styles.live}>
            <span className={styles.beat} /> Value-based view
          </span>
        </div>
      </div>

      <div className={styles.app}>
        <header className={styles.head}>
          <div>
            <h1>Outcomes &amp; value</h1>
            <div className={styles.sub}>Patient-reported health gain across the clinical journey · all sites</div>
          </div>
          <div className={styles.upd}>
            Value = <span className={styles.mono}>outcomes ÷ cost</span>
          </div>
        </header>

        <section className={styles.journey}>
          {journey.map((s, i) => (
            <div key={s.label} className={styles.stage} style={{ animationDelay: `${i * 70}ms` }} data-mounted={mounted}>
              <div className={styles.stageDot} data-kind={s.kind} />
              <div className={styles.stageLabel}>{s.label}</div>
              <div className={styles.stageCap}>{s.capture}</div>
              {i < journey.length - 1 && <div className={styles.stageLine} />}
            </div>
          ))}
        </section>

        <section className={styles.hero}>
          <div className={`${styles.glass} ${styles.heroMain}`}>
            <div className={styles.capLab}>Case-mix-adjusted health gain</div>
            <div className={styles.capNum} ref={gain.ref as never}>
              +{gain.value}
              <span className={styles.pct}>%</span>
            </div>
            <div className={styles.capSub}>
              <span className={styles.delta}>▲ above national</span> patient-reported outcome improvement, weighted across pathways
            </div>
          </div>

          <div className={`${styles.glass} ${styles.stat}`}>
            <div className={styles.statLab}>PROMs pairing rate</div>
            <div className={`${styles.statV} ${styles.mono}`} ref={pairing.ref as never}>
              {pairing.value}%
            </div>
            <div className={styles.foot}>pre and post questionnaires linked · the number most tools quietly drop</div>
          </div>

          <div className={`${styles.glass} ${styles.stat}`}>
            <div className={styles.statLab}>PHIN readiness</div>
            <div className={styles.statV}>
              {sum.phinReadyCount}
              <small>/{sum.phinTotal}</small>
            </div>
            <div className={styles.foot}>instruments submission-ready ahead of the June 2026 CMA deadline</div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Health gain by pathway</h3>
            <p className={styles.cs}>Patient-reported score before and after treatment, against the national benchmark</p>
            <div className={styles.gains}>
              {pathways.map((p) => (
                <GainRow key={p.id} p={p} mounted={mounted} />
              ))}
            </div>
          </div>

          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Value map</h3>
            <p className={styles.cs}>Outcome achieved against relative cost. Bubble size is cohort volume.</p>
            <ValueMap mounted={mounted} />
          </div>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.glass} ${styles.card}`}>
            <h3>PROM completion</h3>
            <p className={styles.cs}>The pipeline that produces a valid outcome: a pre and a post, linked</p>
            <div className={styles.funnel}>
              {[
                { label: 'Eligible for a PROM', value: sum.eligibleForProm, colour: '#155e56' },
                { label: 'Baseline captured', value: sum.preCaptured, colour: '#0e857d' },
                { label: 'Outcome captured & paired', value: sum.postCaptured, colour: '#1fbfa9' },
              ].map((step, i) => {
                const pct = Math.round((step.value / sum.eligibleForProm) * 100)
                return (
                  <div key={step.label}>
                    <div className={styles.fTop}>
                      <b>{step.label}</b>
                      <span className={styles.fN}>{gb(step.value)}</span>
                    </div>
                    <div className={styles.fTrack}>
                      <div
                        className={styles.fFill}
                        style={{ width: mounted ? `${pct}%` : 0, background: `linear-gradient(90deg, ${step.colour}, ${step.colour}cc)`, transitionDelay: `${i * 140}ms` }}
                      >
                        {pct}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className={styles.note}>
              Pairing is where PROMs programmes fail. A beautiful pre-op capture is worthless without the matching post-op, so the whole spine is built to chase the second half.
            </div>
          </div>

          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Instrument coverage</h3>
            <p className={styles.cs}>Every mandated instrument on one capture spine, fired by pathway and timepoint</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Type</th>
                  <th>When</th>
                  <th className={styles.r}>Response</th>
                  <th className={styles.r}>PHIN</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((ins) => (
                  <tr key={ins.name}>
                    <td>
                      <div className={styles.insName}>{ins.name}</div>
                      <div className={styles.insScope}>{ins.scope}</div>
                    </td>
                    <td>
                      <span className={styles.kind} data-kind={ins.kind}>
                        {ins.kind}
                      </span>
                    </td>
                    <td className={styles.when}>{ins.timepoint}</td>
                    <td className={`${styles.r} ${styles.mono}`}>{ins.response}%</td>
                    <td className={styles.r}>
                      <span className={styles.phin} data-state={ins.phin}>
                        {ins.phin}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className={styles.footer}>
          Outcomes shown are illustrative sample data · PROMs are case-mix-adjusted and pared to validated instruments · no patient identifiable data is shown
        </footer>
      </div>
    </div>
  )
}

function GainRow({ p, mounted }: { p: Pathway; mounted: boolean }) {
  const prePct = (p.preScore / p.scoreMax) * 100
  const postPct = (p.postScore / p.scoreMax) * 100
  const vsNational = p.gain - p.benchmarkGain
  return (
    <div className={styles.gain}>
      <div className={styles.gainTop}>
        <div>
          <b>{p.name}</b>
          <span className={styles.gainInstr}>{p.instrument}</span>
        </div>
        <div className={styles.gainNums}>
          <span className={styles.gainBadge}>+{p.gain}</span>
          <span className={styles.gainVs} data-pos={vsNational >= 0}>
            {vsNational >= 0 ? '▲' : '▼'} {Math.abs(vsNational)} vs national
          </span>
        </div>
      </div>
      <div className={styles.gainTrack}>
        <div className={styles.gainPre} style={{ width: mounted ? `${prePct}%` : 0 }} />
        <div className={styles.gainPost} style={{ width: mounted ? `${postPct}%` : 0 }} />
        <span className={styles.gainMark} style={{ left: `${prePct}%` }} />
      </div>
      <div className={styles.gainScale}>
        <span>before {p.preScore}</span>
        <span>after {p.postScore}</span>
      </div>
    </div>
  )
}

const MAP_W = 460
const MAP_H = 300
const PAD = 40

function ValueMap({ mounted }: { mounted: boolean }) {
  const x = (cost: number) => PAD + (cost / 100) * (MAP_W - PAD * 1.4)
  const y = (val: number) => MAP_H - PAD - (val / 100) * (MAP_H - PAD * 1.6)
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} width="100%" height={MAP_H}>
      <line x1={x(50)} y1={PAD * 0.4} x2={x(50)} y2={MAP_H - PAD} stroke="#dcebe7" strokeDasharray="4 4" />
      <line x1={PAD} y1={y(50)} x2={MAP_W - 14} y2={y(50)} stroke="#dcebe7" strokeDasharray="4 4" />
      <text x={PAD} y={PAD * 0.5} fontFamily="Space Mono" fontSize={9} fill="#0e857d">HIGH VALUE</text>
      <text x={MAP_W - 96} y={MAP_H - PAD - 6} fontFamily="Space Mono" fontSize={9} fill="#c0432f">HIGH COST, LOW GAIN</text>
      <text x={PAD} y={MAP_H - 8} fontFamily="Space Mono" fontSize={9} fill="#7c9a94">low cost →</text>
      <text x={MAP_W - 60} y={MAP_H - 8} fontFamily="Space Mono" fontSize={9} fill="#7c9a94">high cost</text>
      {pathways.map((p, i) => {
        const r = Math.max(7, Math.min(22, Math.sqrt(p.cohort)))
        const c = valueColour(p.value)
        return (
          <g key={p.id} style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.5s ${0.3 + i * 0.1}s` }}>
            <circle cx={x(p.cost)} cy={y(p.value)} r={r} fill={c} fillOpacity={0.16} stroke={c} strokeWidth={1.5} />
            <circle cx={x(p.cost)} cy={y(p.value)} r={3} fill={c} />
            <text x={x(p.cost)} y={y(p.value) - r - 4} textAnchor="middle" fontFamily="Inter" fontSize={10} fill="#063d39">
              {p.name.split(' ')[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
