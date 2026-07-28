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
attach a custom domain (e.g. straighttalking.co.uk).

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

Point `straighttalking.co.uk` at whichever host above (each has a
"custom domain" flow). Force HTTPS - all of these do it automatically.

## The single-file demo (for stakeholders, no server)

```bash
npx vite build --config vite.viewer.config.ts   # -> dist-viewer/index.viewer.html
```
That one file opens from `file://` (email it, drop it on a USB stick). It has the
bottom surface-switcher and the live demo loop, and is router-free by design.
