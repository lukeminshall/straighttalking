import { Link, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProviderLanding } from './routes/ProviderLanding'
import { Setup } from './routes/Setup'
import { Reorder } from './routes/Reorder'
import { PatientApp } from './routes/PatientApp'
import { Dashboard } from './routes/Dashboard'
import { Moderate } from './routes/Moderate'
import { BoardLive } from './routes/BoardLive'
import { Support } from './routes/Support'
import { Privacy } from './routes/Privacy'
import { AuthProvider, Protected } from './app/AuthProvider'
import { OperatorProvider } from './app/OperatorProvider'

// Operator surfaces (/app, /app/moderate) are gated by Clerk (when configured)
// and fed live, authenticated data by OperatorProvider. Public surfaces stay
// outside this wrapper so the landing, patient app, board and support space
// never require sign-in.
function Operator({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Protected>
        <OperatorProvider>{children}</OperatorProvider>
      </Protected>
    </AuthProvider>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ProviderLanding />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/reorder" element={<Reorder />} />
      <Route path="/feedback" element={<PatientApp />} />
      <Route path="/support" element={<Support />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/board" element={<BoardLive />} />
      <Route path="/board/:siteId" element={<BoardLive />} />
      <Route path="/app" element={<Operator><Dashboard /></Operator>} />
      <Route path="/app/moderate" element={<Operator><Moderate /></Operator>} />
      <Route path="/preview" element={<PreviewIndex />} />
      <Route path="*" element={<ProviderLanding />} />
    </Routes>
  )
}

const surfaces = [
  { to: '/', label: 'Provider landing', note: 'Marketing site for providers, ICBs and governance teams.' },
  { to: '/setup', label: 'Set up your clinic', note: 'Self-serve onboarding: configure, order resources, pay, go live.' },
  { to: '/reorder', label: 'Reorder resources', note: 'Admin resupply of printed codes and stands, plan unchanged.' },
  { to: '/feedback', label: 'Patient app', note: 'The QR destination. Rate a visit and route the feedback.' },
  { to: '/support', label: 'Peer support', note: 'Anonymous patient-to-patient support space.' },
  { to: '/app', label: 'Operator dashboard', note: 'Live capture-rate and sentiment intelligence across sites.' },
  { to: '/app/moderate', label: 'Moderation', note: 'Flagged feedback + reported peer content. Operator sign-in.' },
  { to: '/board', label: 'Clinic board', note: 'Waiting-room display. Best viewed full-screen on 16:9.' },
  { to: '/privacy', label: 'Privacy notice', note: 'Public fair-processing notice. Cookie preferences reopener.' },
]

function PreviewIndex() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f1e9',
        color: '#14312d',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 560, fontSize: 30, letterSpacing: '-0.015em' }}>
          Straight Talking <span style={{ fontStyle: 'italic', color: '#0b6b64' }}>surfaces</span>
        </div>
        <p style={{ color: '#46564f', marginTop: 8, marginBottom: 26 }}>Development index. Each link is a routable surface in the app.</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {surfaces.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              style={{
                display: 'block',
                padding: '18px 20px',
                borderRadius: 12,
                border: '1px solid #e5e0d4',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(20,49,45,0.05)',
              }}
            >
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 560, fontSize: 18 }}>{s.label}</div>
              <div style={{ color: '#46564f', fontSize: 14, marginTop: 4 }}>{s.note}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", color: '#0b6b64', fontSize: 12, marginTop: 8 }}>{s.to}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
