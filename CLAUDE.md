# CLAUDE.md

Brief for any Claude Code session working on this repo. Read this first.

## What this is

Straight Talking is a patient-reported feedback and outcomes platform for UK healthcare. It is positioned not as a satisfaction widget but as the patient-reported spine of the whole clinical journey: one clean, high-capture capture layer that emits every mandated instrument (FFT, PROMs, PREMs, PHIN QPROMs) and turns paired outcomes into the health-gain half of a value-based-care equation. Timing hook: PHIN full CMA-Order compliance lands June 2026, and the NHS now ranks providers on experience.

It is built to be self-serve and high-volume, low-margin: a clinic sets itself up, orders resources, pays, and goes live the same day with no one from our side in the loop.

Owner: Luke Minshall, Operations Director at Medical Imaging Partnership (MIP) / Prime Health.

## Run it

```bash
npm install
npm run dev        # Vite dev server at localhost, hot reload. Use this to see changes live.
npm run build      # tsc (x2 projects) + vite build -> dist/  (production, router-based)
npm run typecheck  # type-check only, no emit
```

Single-file demo build (the self-contained HTML we hand to stakeholders):

```bash
npx vite build --config vite.viewer.config.ts   # -> dist-viewer/index.viewer.html
```

TypeScript is strict, including `noUnusedLocals` and `noUnusedParameters`. A build fails on an unused import or variable, so clean them up.

## Two entry points, and a hard rule

There are deliberately two ways the same surfaces are shipped:

1. **Production app** (`src/main.tsx` -> `src/App.tsx`): a normal `BrowserRouter` app with real routes. This is the real product.
2. **Viewer** (`src/viewer-main.tsx` -> `src/Viewer.tsx`, `index.viewer.html`, `vite.viewer.config.ts`): a single self-contained HTML file with every asset inlined, used for demos opened from `file://`. It uses `vite-plugin-singlefile`.

**Hard rule for the viewer:** it must stay router-free. React Router calls `new URL(path, location.origin)`, and on `file://` in iOS/WebKit `location.origin` is `"null"`, which throws and white-screens the whole demo. `Viewer.tsx` therefore does its own state-based surface switcher (a `TABS` list and an `HREF_MAP`), not routes. After any viewer build, verify the output is clean:

```bash
grep -c "new URL(\|location.origin\|react-router" dist-viewer/index.viewer.html   # must be 0
```

When you add a new surface, wire it into BOTH `App.tsx` (a `<Route>` plus the dev preview list) and `Viewer.tsx` (the `Surface` union, `TABS`, `HREF_MAP`, and the render switch).

## Surfaces

| Route        | Component          | Who                    | What |
| ------------ | ------------------ | ---------------------- | ---- |
| `/`          | ProviderLanding    | Providers, ICBs        | Marketing: capture / comply / prove value, journey, VBHC, data-and-security footer |
| `/setup`     | Setup              | Providers (self-serve) | Onboarding wizard: organisation, instruments, order resources, pay, details, go live |
| `/reorder`   | Reorder            | Providers (admin)      | Standing resupply of printed codes and stands, plan unchanged |
| `/feedback`  | PatientApp         | Patients               | The patient app; opens the FeedbackFlow modal |
| `/app`       | Dashboard          | Operations, quality    | Live capture-rate and sentiment intelligence |
| `/outcomes`  | Outcomes           | Clinical, value leads  | PROMs health gain, value map, PHIN readiness |
| `/board/:id` | ClinicBoard        | Waiting rooms          | In-clinic voices board |

## Architecture

- **Design tokens** in `src/styles/tokens.css` (all `--st-*`). Everything is themed off these. The whole product is now a single light theme (white backgrounds, ink text, teal accents). Do not reintroduce dark surfaces without asking.
- **CSS Modules** per component (`X.module.css`). No global styles beyond `global.css` and tokens.
- **Charts** in `src/components/charts` (Sparkline, TrendLine, Donut) and `src/components/map/SiteMap` are bespoke SVG and theme-aware: pass `light` (and colour props) for the light surfaces.
- **DemoContext** (`src/demo/DemoContext.tsx`) is the live demo loop: a patient submission ripples into the dashboard feed and counters. Its default is static sample data with a no-op submit, so production paths are unchanged; `DemoProvider` (used only by the viewer) makes it live.
- **i18n** (`src/i18n/patient.ts`): patient-facing strings keyed by language. English, Cymraeg, Polski, Romana, Portugues, and Urdu (RTL). Adding a language is one entry here, no UI change; RTL sets `dir="rtl"` on the patient app.
- **Data** in `src/data` (sites, board, feedback, outcomes, resources). `resources.ts` holds the shared catalogue and `ANNUAL_FEE`, used by both Setup and Reorder.
- **Path alias:** import from `@/...` (maps to `src/`).
- **Button** (`src/components/ui/Button.tsx`) is a discriminated union: `as="a"` gives link props (no `onClick` typing) and `as="button"` gives button props. Match the variant to the surface (`ghost` on light, not `ghost-dark`).

## Product model (the domain logic that matters)

- **Instrument routing is patient-led.** The patient self-declares what they were seen for (plain-language options in `FeedbackFlow.tsx` -> `PATHWAYS`), and that single choice picks the instruments. No PAS/EPR eligibility engine. Everyone gets FFT and the experience questions; a procedure additionally fires the matching PROM baseline (`PROM_SETS`).
- **A PROM is a matched pair.** A baseline alone is not an outcome. The flow captures the "before" at first scan and offers an optional follow-up contact (mobile/email) so the "after" can be sent at the validated interval and linked. No follow-up contact means no pair, just a baseline. This is the one thing outcomes need, and it is a contact point, not an integration.
- **Instruments are shown paraphrased** in the demo for copyright reasons. In production these are the licensed instruments: Oxford Hip/Knee via Oxford University Innovation, EQ-5D via EuroQol, Cat-PROM5. Keep the paraphrase-plus-note pattern until licensing is in place.
- **Pricing is a flat GBP 200 annual fee only** (`ANNUAL_FEE`), plus one-off resources. Not per-seat, not monthly.
- **Never collect card details in the client.** Checkout is a mock; real payment goes through a PCI-compliant provider (Stripe). Do not add card-number inputs.

## House style

- UK English throughout.
- **No em dashes.** Use hyphens or colons. This applies to code comments and UI copy too.
- Copy is warm, plain, and confident. Professional with personality, not corporate. Think good product copy, not marketing fluff.
- Keep production paths clean: features are added without breaking the router build or the router-free viewer.

## Verifying changes

1. `npm run typecheck` (or `npm run build`) after edits.
2. `npm run dev` and check the surface in the browser. This is the main advantage of working here: see it live rather than rebuilding a static file.
3. If you touched anything the viewer ships, rebuild the viewer and run the `grep` crash-trigger check above.

## Backlog / next steps

- Real per-clinic QR generation (currently a placeholder image on the go-live and reorder screens).
- Stripe checkout for setup and reorder (server-side; never touch card data client-side).
- License and wire the real instruments (Oxford, EQ-5D, Cat-PROM5) behind the current paraphrased sets.
- Translate the full feedback flow, not just the patient landing; add more NHS languages (Punjabi, Bengali, Gujarati, Arabic).
- Reconciliation view: list "eligible but not captured" so no patient is missed, and surface the pre/post pairing rate as the assurance metric.
- Persist PROM answers into a real store and feed the Outcomes surface from live data rather than sample data.
- PHIN and NHS Digital submission-ready export formats.
