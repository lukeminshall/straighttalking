import { useEffect, useRef } from 'react'
import { sites as allSites, STATUS_COLOUR, type Site, type SiteStatus } from '@/data/sites'
import styles from './SiteMap.module.css'

const GB_PATH =
  'M53,5 C57,7 57,12 55,16 C60,17 62,22 60,27 C65,31 67,39 65,46 C69,49 73,51 72,56 C70,60 66,58 65,61 C66,65 63,69 59,70 C55,71 53,68 50,70 C45,72 40,70 36,73 C31,76 26,78 24,74 C29,72 33,71 34,67 C36,63 32,61 30,60 C25,58 21,57 24,52 C29,51 33,54 35,51 C34,47 37,44 40,44 C38,40 33,38 36,33 C41,32 43,36 45,33 C44,28 45,23 43,19 C41,14 45,9 48,8 C50,6 51,5 53,5 Z'

const markerRadius = (volume: number) => Math.max(9, Math.min(24, Math.sqrt(volume) * 0.9))

const LIGHT_STATUS: Record<SiteStatus, string> = {
  good: '#0e857d',
  watch: '#e0a13c',
  quiet: '#f76f5c',
}

interface SiteMapProps {
  sites?: Site[]
  light?: boolean
}

export function SiteMap({ sites = allSites, light }: SiteMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const statusColour = light ? LIGHT_STATUS : STATUS_COLOUR

  useEffect(() => {
    const nodes = wrapRef.current?.querySelectorAll<HTMLElement>(`.${styles.site}`)
    nodes?.forEach((node, i) => {
      window.setTimeout(() => node.setAttribute('data-pop', 'true'), 500 + i * 120)
    })
  }, [])

  return (
    <div className={styles.wrap} ref={wrapRef} data-light={light}>
      <svg className={styles.base} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id={light ? 'map-land-l' : 'map-land'} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor={light ? '#eff8f6' : '#0e413a'} />
            <stop offset="1" stopColor={light ? '#dcefeb' : '#082b26'} />
          </radialGradient>
        </defs>
        <path d={GB_PATH} fill={`url(#${light ? 'map-land-l' : 'map-land'})`} stroke={light ? '#bcdbd4' : '#17564d'} strokeWidth={0.5} />
        <g stroke={light ? '#d9ebe7' : '#0f3e37'} strokeWidth={0.3} opacity={0.6}>
          {[20, 40, 60, 80].map((x) => (
            <line key={x} x1={x} y1={0} x2={x} y2={100} />
          ))}
          {[25, 50, 75].map((y) => (
            <line key={y} x1={0} y1={y} x2={100} y2={y} />
          ))}
        </g>
      </svg>

      {sites.map((site) => {
        const r = markerRadius(site.volume30d)
        const colour = statusColour[site.status]
        return (
          <div
            key={site.id}
            className={styles.site}
            style={{ left: `${site.map.x}%`, top: `${site.map.y}%`, color: colour }}
          >
            <span className={styles.ring} style={{ width: r, height: r }} />
            <span className={styles.dot} style={{ width: r, height: r }} />
            <span className={styles.label}>{site.name}</span>
            <span className={styles.cap}>{site.captureRate}%</span>
          </div>
        )
      })}

      <div className={styles.legend}>
        <span>
          <i style={{ background: 'var(--st-teal-g)' }} />
          On track
        </span>
        <span>
          <i style={{ background: 'var(--st-amber)' }} />
          Watch
        </span>
        <span>
          <i style={{ background: 'var(--st-coral)' }} />
          Quiet
        </span>
      </div>
    </div>
  )
}
