# Straight Talking

Independent patient feedback platform. Capture the patient voice at the point of care, route it by sentiment, and monitor it across every location.

**Say it straight. We're listening.**

---

## Stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **React Router 6** for the four surfaces
- **CSS Modules** + a single design-token layer (`src/styles/tokens.css`)
- Motion via CSS keyframes and two small hooks (`useReveal`, `useCountUp`). No animation library.
- Zero UI/chart dependencies: the map and charts are bespoke, typed SVG components.

This mirrors the DataLense stack (React + TS + Vite) so the app can drop into that shell. Auth and the data layer are deliberately left as clean integration points rather than wired to a backend (see [Data](#data)).

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # tsc -b && vite build  (type-checks, then bundles to dist/)
npm run preview    # serve the production build
npm run typecheck  # types only
```

## Surfaces

The app is four routable surfaces. Visit `/preview` for a dev index that links them all.

| Route            | Surface            | Audience            | Notes                                             |
| ---------------- | ------------------ | ------------------- | ------------------------------------------------- |
| `/`              | Provider landing   | Providers, ICBs     | The commercial sell. Dark, marketing-led.         |
| `/feedback`      | Patient app        | Patients            | The QR destination. Rate a visit, route feedback. |
| `/setup`         | Set up (self-serve) | Providers          | Onboard, order resources, pay, add details, go live. |
| `/reorder`       | Reorder resources  | Providers (admin)  | Standing resupply of printed codes and stands.       |
| `/app`           | Operator dashboard | Operations, quality | Live capture-rate and sentiment intelligence.     |
| `/outcomes`      | Outcomes & value   | Clinical, value leads | PROMs health gain, value map, PHIN readiness.   |
| `/board/:siteId` | Clinic board       | Waiting rooms       | Kiosk display. Best full-screen on 16:9.          |

In production these would likely be separated by concern: `/feedback` and `/board` are unauthenticated (patient and kiosk), `/app` sits behind auth, `/` is the public marketing site. Routing is currently flat for ease of review.

## Project structure

```
src/
  main.tsx                 # entry, BrowserRouter
  App.tsx                  # route table + dev preview index
  styles/
    tokens.css             # single source of truth for colour, type, radius, motion
    global.css             # reset, .reveal primitive, shared keyframes
  lib/
    hooks/useReveal.ts     # reveal-on-scroll (IntersectionObserver)
    hooks/useCountUp.ts    # number count-up on view
    format.ts              # gb(), stars(), reference()
  data/                    # typed sample data (the shape a real API should return)
    sites.ts  feedback.ts  board.ts
  components/
    brand/Logo.tsx
    ui/Button.tsx
    charts/                # Sparkline, TrendLine, Donut (bespoke SVG)
    map/SiteMap.tsx        # schematic UK map with status markers
  features/
    patient/FeedbackFlow.tsx   # six-step feedback modal
  routes/                  # one component + CSS module per surface
    ProviderLanding  PatientApp  Dashboard  ClinicBoard
```

## Design system

All colour, type, radius and motion values live in `src/styles/tokens.css` as `--st-*` custom properties. Components reference tokens, never raw hex. Two palettes are defined: light (patient app, board, landing content) and dark (dashboard, landing hero). Change a brand value in one place and it propagates everywhere.

Type: Space Grotesk (display), Inter (body), Space Mono (data/references), loaded in `index.html`.

Motion respects `prefers-reduced-motion` globally.

## Live demo mode

The single-file review build (`straight-talking-app.html`) is wired as a connected demo: submitting feedback in the patient app routes by sentiment and ripples through to the dashboard live feed and counters, and a compliment surfaces on the waiting-room board. This is the whole product loop shown in one session.

It's kept out of the production paths. `src/demo/DemoContext.tsx` exposes a store via React context whose **default value is the static sample data with a no-op `submit`**. The surfaces read from `useDemo()`. In the production app (`App.tsx`, no provider) they get the static defaults and behave exactly as before; only the review shell (`Viewer.tsx`) mounts `DemoProvider` to make it live. To go to a real backend, replace the provider's internals with data-fetching; the surfaces don't change.

## Data

Everything under `src/data/` is **typed sample data**. It defines the shape a real backend should return (`Site`, `FeedbackItem`, `YouSaidWeDid`, etc.). To go live, replace these modules with data-fetching against your backend. To match DataLense, that means:

- **Supabase** for feedback storage, per-site aggregates and the you-said-we-did content.
- **Clerk** for operator auth on `/app`. Note the DataLense gotcha: the Supabase JWT template must include `"role": "authenticated"` or RLS returns empty arrays.
- **TanStack Query** as the fetching layer, swapped in where the routes currently import from `src/data/`.

The patient app and board are anonymous by design and need no auth.

## Placeholders to replace before launch

- **QR code** (`public/qr-sussex.png`) points at `https://straighttalking.co.uk/f/sussex`. Regenerate per site against the real form URL.
- **Domain**: `straighttalking.co.uk` is assumed throughout. A charity operates `straighttalking.org`, so run a trademark check before committing to the name.
- **CQC ratings** on the clinic board are sample values. Pull real per-site ratings from a single source so the board can't drift out of date.
- **Sample data**: all capture rates, volumes, quotes and sentiment splits are illustrative.
- **Routing hand-offs**: Google review, Datix and Radar destinations are represented in the UI but not integrated. Each needs a real API/deep-link.

## Licence

Proprietary. All rights reserved.
