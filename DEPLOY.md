# Deploying Straight Talking

The app is a static Vite + React single-page app. `npm run build` outputs a
fully static `dist/` you can host anywhere. Because it uses client-side routing
(React Router), the host must serve `index.html` for every path. The configs for
that are already in this repo:

- `public/_redirects` -> ships as `dist/_redirects` (Netlify, Cloudflare Pages)
- `netlify.toml` (Netlify)
- `vercel.json` (Vercel)

## Fastest way live (no account, no CLI): Netlify Drop

1. Run the build:
   ```bash
   npm install
   npm run build
   ```
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder onto the page.

You get a live `*.netlify.app` URL in seconds. Sign in (free) to keep it and
attach a custom domain (e.g. straighttalking.org.uk).

## Netlify via CLI (to your account)

```bash
npm install
npm run build
npx netlify deploy --prod --dir=dist
```
First run prompts a browser login and to pick/create a site.

## Vercel

```bash
npm install -g vercel
vercel            # preview
vercel --prod     # production
```
`vercel.json` handles the SPA rewrite and build settings.

## Cloudflare Pages

Connect the repo in the Cloudflare dashboard, or:
```bash
npm run build
npx wrangler pages deploy dist
```
Build command `npm run build`, output dir `dist`. `_redirects` handles routing.

## Custom domain

Point `straighttalking.org.uk` at whichever host above (each has a
"custom domain" flow). Force HTTPS - all of these do it automatically.

## The single-file demo (for stakeholders, no server)

```bash
npx vite build --config vite.viewer.config.ts   # -> dist-viewer/index.viewer.html
```
That one file opens from `file://` (email it, drop it on a USB stick). It has the
bottom surface-switcher and the live demo loop, and is router-free by design.

## Go-live checklist: multi-practice (GP launch)

Each practice must see only its own data. Do these once, in order:

1. **Apply the migration** `supabase/migrations/20261030000001_practice_scoping.sql`
   to the production Supabase project (SQL editor, or `supabase db push`).
2. **Clerk session token:** Clerk dashboard > Sessions > Customize session token, add
   `{ "email": "{{user.primary_email_address}}" }`. Operators claim their practice
   by matching this email to the invite created at sign-up.
3. **Make yourself a platform admin** (sees every practice). Sign in once at `/app`,
   copy your Clerk user id (`user_...`) from the Clerk dashboard, then run:
   `insert into public.platform_admins (user_id, email) values ('user_...', 'you@example.com');`
4. **Vercel env vars** (Production), needed by the Stripe webhook to create the
   practice and its owner invite:
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project settings > API, secret)
   - `STRIPE_WEBHOOK_SECRET` (Stripe > Webhooks > the endpoint's signing secret)
5. **Existing practice** (e.g. `sussex-imaging`): add its operators by hand:
   `insert into public.practice_invites (practice_id, email, role) select id, 'manager@practice.nhs.net', 'owner' from public.practices where slug = 'sussex-imaging';`

Until step 1 is applied, every signed-in operator can read every practice's
feedback and reply contacts, so do not onboard a second practice before then.
