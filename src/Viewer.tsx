import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { ProviderLanding } from './routes/ProviderLanding'
import { Setup } from './routes/Setup'
import { Reorder } from './routes/Reorder'
import { PatientApp } from './routes/PatientApp'
import { Dashboard } from './routes/Dashboard'
import { Outcomes } from './routes/Outcomes'
import { ClinicBoard } from './routes/ClinicBoard'
import { DemoProvider, useDemo } from './demo/DemoContext'

type Surface = 'landing' | 'setup' | 'patient' | 'dashboard' | 'outcomes' | 'board' | 'reorder'

const TABS: { key: Surface; label: string }[] = [
  { key: 'landing', label: 'Landing' },
  { key: 'setup', label: 'Set up' },
  { key: 'patient', label: 'Patient' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'outcomes', label: 'Outcomes' },
  { key: 'board', label: 'Board' },
  { key: 'reorder', label: 'Reorder' },
]

const HREF_MAP: Record<string, Surface> = {
  '/': 'landing',
  '/setup': 'setup',
  '/reorder': 'reorder',
  '/feedback': 'patient',
  '/app': 'dashboard',
  '/outcomes': 'outcomes',
  '/board': 'board',
}

export function Viewer() {
  return (
    <DemoProvider>
      <Shell />
    </DemoProvider>
  )
}

function Shell() {
  const demo = useDemo()
  const [surface, setSurface] = useState<Surface>('landing')
  const [toast, setToast] = useState<{ text: string; praise: boolean } | null>(null)
  const seenEvent = useRef<number | null>(null)

  // Surface a toast whenever new feedback is submitted from another surface.
  useEffect(() => {
    const ev = demo.lastEvent
    if (!ev || ev.id === seenEvent.current) return
    seenEvent.current = ev.id
    if (surface === 'dashboard') return
    setToast({
      text: ev.praise ? 'Feedback captured, pushed to Google' : `Feedback captured, routed to ${ev.label}`,
      praise: ev.praise,
    })
    const t = window.setTimeout(() => setToast(null), 7000)
    return () => clearTimeout(t)
  }, [demo.lastEvent, surface])

  const onCapture = (e: MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (!anchor) return
    const href = anchor.getAttribute('href') ?? ''
    if (href in HREF_MAP) {
      e.preventDefault()
      setSurface(HREF_MAP[href])
    } else if (href.startsWith('/')) {
      e.preventDefault()
    }
  }

  const go = (s: Surface) => {
    setToast(null)
    setSurface(s)
  }

  return (
    <>
      <div onClickCapture={onCapture} key={surface} style={{ animation: 'st-rise 0.4s ease' }}>
        {surface === 'landing' && <ProviderLanding />}
        {surface === 'setup' && <Setup />}
        {surface === 'patient' && <PatientApp />}
        {surface === 'dashboard' && <Dashboard />}
        {surface === 'outcomes' && <Outcomes />}
        {surface === 'board' && <ClinicBoard />}
        {surface === 'reorder' && <Reorder />}
      </div>

      {toast && (
        <button style={toastStyle} onClick={() => go('dashboard')}>
          <span style={{ ...toastDot, background: toast.praise ? '#13a093' : '#cf6a53' }} />
          <span style={toastText}>{toast.text}</span>
          <span style={toastCta}>View on dashboard →</span>
        </button>
      )}

      <nav style={navStyle}>
        <span style={liveDot} />
        {TABS.map((t) => (
          <button key={t.key} onClick={() => go(t.key)} style={{ ...tabStyle, ...(surface === t.key ? activeStyle : {}) }}>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}

const navStyle: CSSProperties = {
  position: 'fixed',
  bottom: 14,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '5px 5px 5px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid #e5e0d4',
  boxShadow: '0 8px 30px rgba(20,49,45,0.14)',
  fontFamily: 'Inter, sans-serif',
}

const liveDot: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: '#13a093',
  marginRight: 6,
  animation: 'st-blip 2s infinite',
}

const tabStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#46564f',
  padding: '9px 15px',
  borderRadius: 999,
  lineHeight: 1,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
}

const activeStyle: CSSProperties = { background: '#0b6b64', color: '#fff' }

const toastStyle: CSSProperties = {
  position: 'fixed',
  bottom: 74,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '13px 18px',
  borderRadius: 14,
  background: '#ffffff',
  border: '1px solid #e5e0d4',
  boxShadow: '0 16px 40px rgba(20,49,45,0.16)',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  maxWidth: '92vw',
  animation: 'st-rise 0.4s ease',
}

const toastDot: CSSProperties = { width: 9, height: 9, borderRadius: '50%', flex: 'none' }
const toastText: CSSProperties = { color: '#14312d', fontSize: 14, fontWeight: 500 }
const toastCta: CSSProperties = { color: '#0b6b64', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }
