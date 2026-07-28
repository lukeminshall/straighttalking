import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { SiteMap } from '@/components/map/SiteMap'
import { Sparkline } from '@/components/charts/Sparkline'
import { TrendLine } from '@/components/charts/TrendLine'
import { Donut } from '@/components/charts/Donut'
import { sites, STATUS_COLOUR, STATUS_LABEL } from '@/data/sites'
import { funnel, drivers, captureTrend, networkAverage, feedbackStream, type FeedbackItem } from '@/data/feedback'
import { themes } from '@/data/board'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { useDemo } from '@/demo/DemoContext'
import { gb, stars } from '@/lib/format'
import styles from './Dashboard.module.css'

const STREAM_MS = 5200

export function Dashboard() {
  const demo = useDemo()
  const [mounted, setMounted] = useState(false)
  const [autoStream, setAutoStream] = useState<FeedbackItem[]>(feedbackStream.slice(0, 5))
  const cap = useCountUp(92.4, { decimals: 1, duration: 1800, start: true })

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    if (demo.live) return () => cancelAnimationFrame(raf)
    let cursor = 5
    const id = window.setInterval(() => {
      const next = feedbackStream[cursor % feedbackStream.length]
      cursor += 1
      setAutoStream((prev) => [next, ...prev].slice(0, 6))
    }, STREAM_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(id)
    }
  }, [demo.live])

  const stream = demo.live ? demo.feed.slice(0, 6) : autoStream
  const ranked = [...sites].sort((a, b) => b.captureRate - a.captureRate)
  const eligible = funnel[0].value

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.brand}>
            <Logo variant="colour" height={30} />
          </div>
          <div className={styles.ctrl}>
            <div className={styles.seg}>
              <button className={styles.on}>30d</button>
              <button>7d</button>
              <button>QTD</button>
            </div>
            <span className={styles.live}>
              <span className={styles.beat} /> Live
            </span>
          </div>
        </div>
      </div>

      <div className={styles.app}>
        <header className={styles.head}>
          <div>
            <h1>Feedback intelligence</h1>
            <div className={styles.sub}>All sites · Medical Imaging Partnership</div>
          </div>
          <div className={styles.upd}>
            Last sync <span className={styles.mono}>08 Jul 2026 · 09:14</span>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={`${styles.glass} ${styles.capbox}`}>
            <div className={styles.capLab}>Capture rate</div>
            <div className={styles.capNum}>
              {cap.value}
              <span className={styles.pct}>%</span>
            </div>
            <div className={styles.capSub}>
              <span className={styles.delta}>▲ 4.1 pts</span> of eligible visits left feedback this month
            </div>
            <div className={styles.capWave}>
              <Sparkline values={[70, 72, 71, 75, 74, 78, 80, 79, 83, 86, 88, 92]} colour="#0e857d" fill height={80} />
            </div>
          </div>

          <div className={`${styles.glass} ${styles.stat}`}>
            <div>
              <div className={styles.statLab}>Feedback captured</div>
              <div className={`${styles.statV} ${styles.mono}`} key={demo.capturedCount} data-live={demo.live}>
                {gb(demo.capturedCount)}
              </div>
            </div>
            <div>
              <div className={styles.mini}>
                <Sparkline values={[40, 44, 42, 50, 48, 55, 60, 58, 66, 70, 80, 92]} colour="#0e857d" height={34} />
              </div>
              <div className={styles.foot}>
                <span className={styles.up}>▲ 11%</span> vs last month · 3.4k voices
              </div>
            </div>
          </div>

          <div className={`${styles.glass} ${styles.stat}`}>
            <div>
              <div className={styles.statLab}>Concerns resolved</div>
              <div className={styles.statV}>
                34<small>/{demo.concernsLogged}</small>
              </div>
            </div>
            <div className={styles.foot}>
              92% closed · median 6.2h to first action · routed to Datix / Radar
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Live site map</h3>
            <p className={styles.cs}>Marker size by volume, colour by status. Every tap tagged to its location on landing.</p>
            <SiteMap light />
          </div>

          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Capture funnel</h3>
            <p className={styles.cs}>Where eligible visits turn into captured feedback, last 30 days</p>
            <div className={styles.funnel}>
              {funnel.map((step, i) => {
                const pct = Math.round((step.value / eligible) * 100)
                return (
                  <div key={step.label}>
                    <div className={styles.fTop}>
                      <b>{step.label}</b>
                      <span className={styles.fN}>{gb(step.value)}</span>
                    </div>
                    <div className={styles.fTrack}>
                      <div
                        className={styles.fFill}
                        style={{
                          width: mounted ? `${pct}%` : 0,
                          background: `linear-gradient(90deg, ${step.colour}, ${step.colour}cc)`,
                          transitionDelay: `${i * 140}ms`,
                        }}
                      >
                        {pct}%
                      </div>
                    </div>
                    <div className={styles.fDrop}>
                      {i ? `−${funnel[i - 1].value - step.value} vs step above` : 'top of funnel'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Capture rate trend</h3>
            <p className={styles.cs}>Share of eligible visits leaving feedback · 12 weeks · network avg dashed</p>
            <TrendLine values={captureTrend} benchmark={networkAverage} benchmarkLabel="network 82%" light />
          </div>

          <div className={`${styles.glass} ${styles.card}`}>
            <h3>What drives the score</h3>
            <p className={styles.cs}>Themes lifted from 3,418 pieces of feedback</p>
            <div className={styles.senRow}>
              <Donut
                segments={[
                  { value: 78, colour: '#0e857d' },
                  { value: 14, colour: '#e0a13c' },
                  { value: 8, colour: '#f76f5c' },
                ]}
                centre="4.6"
                centreSub="avg"
                light
              />
              <div className={styles.leg}>
                <div>
                  <i style={{ background: '#0e857d' }} />
                  Praise <b>78%</b>
                </div>
                <div>
                  <i style={{ background: '#e0a13c' }} />
                  Neutral <b>14%</b>
                </div>
                <div>
                  <i style={{ background: '#f76f5c' }} />
                  Concern <b>8%</b>
                </div>
              </div>
            </div>
            <div className={styles.drv}>
              {drivers.map((d) => (
                <div key={d.label}>
                  <div className={styles.drvTop}>
                    <span>{d.label}</span>
                    <span className={styles.drvC}>{d.score}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <span style={{ width: mounted ? `${d.score}%` : 0, background: d.colour }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.glass} ${styles.card} ${styles.full}`}>
          <h3>Location monitoring</h3>
          <p className={styles.cs}>Capture rate, volume and sentiment by site. Quiet sites are flagged the moment coverage slips.</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Site</th>
                <th>Capture rate</th>
                <th className={styles.r}>Volume 30d</th>
                <th className={styles.r}>Avg</th>
                <th>Sentiment</th>
                <th className={styles.r}>4-wk</th>
                <th className={styles.r}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => {
                const colour = STATUS_COLOUR[s.status]
                return (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.stName}>
                        <span className={styles.pin} style={{ color: colour }} />
                        {s.name}
                      </div>
                    </td>
                    <td>
                      <div className={styles.capCell}>
                        <div className={styles.capMini}>
                          <span style={{ width: mounted ? `${s.captureRate}%` : 0, background: colour }} />
                        </div>
                        <span className={styles.capVal} style={{ color: colour }}>
                          {s.captureRate}%
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.r} ${styles.mono}`}>{gb(s.volume30d)}</td>
                    <td className={styles.r}>{s.avgRating}</td>
                    <td>
                      <div className={styles.sent}>
                        <span style={{ width: `${s.sentiment[0]}%`, background: '#0e857d' }} />
                        <span style={{ width: `${s.sentiment[1]}%`, background: '#e0a13c' }} />
                        <span style={{ width: `${s.sentiment[2]}%`, background: '#f76f5c' }} />
                      </div>
                    </td>
                    <td className={`${styles.r} ${styles.trend}`}>
                      {s.trend > 0 ? <span className={styles.up}>▲ {s.trend}</span> : <span className={styles.dn}>▼ {Math.abs(s.trend)}</span>}
                    </td>
                    <td className={styles.r}>
                      <span className={styles.badge} data-status={s.status}>
                        <span className={styles.badgeDot} />
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <section className={styles.grid}>
          <div className={`${styles.glass} ${styles.card}`}>
            <h3>Rising themes</h3>
            <p className={styles.cs}>What people are talking about, and where it's moving</p>
            <div className={styles.themes}>
              {themes.map((t) => (
                <span key={t.label} className={styles.chip} data-neg={t.negative}>
                  {t.label} <span className={styles.chipC}>{t.count}</span> <span className={styles.chipUp}>{t.delta}</span>
                </span>
              ))}
            </div>
            <div className={styles.themeNote}>
              <b>{gb(demo.googlePushed)}</b> five-star reviews pushed to Google this month via one-tap share, lifting the network rating to <b>4.6★</b>.
            </div>
          </div>

          <div className={`${styles.glass} ${styles.card}`}>
            <h3>
              Live feed
              <span className={styles.live} style={{ marginLeft: 'auto' }}>
                <span className={styles.beat} />
              </span>
            </h3>
            <p className={styles.cs}>Anonymised · reference and service only · routed automatically</p>
            <div className={styles.stream}>
              {stream.map((item, i) => (
                <div className={styles.item} key={`${item.location}-${i}`} data-you={item.you}>
                  <span className={styles.rt} data-route={item.route} />
                  <div>
                    <div className={styles.q}>{item.quote}</div>
                    <div className={styles.itemMeta}>
                      {item.you && <span className={styles.youTag}>You · just now</span>}
                      <span>{item.location}</span>
                      <span className={styles.qStars}>{stars(item.rating)}</span>
                      <span className={styles.tag} data-route={item.route}>
                        {item.routeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          Straight Talking Intelligence · figures shown are illustrative sample data · no patient identifiable data is held against feedback
        </footer>
      </div>
    </div>
  )
}
