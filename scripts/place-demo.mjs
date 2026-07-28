// Copies the self-contained viewer build into the production output, so the
// live site serves the full interactive demo (the stakeholder single-file
// build, with the bottom surface-switcher) at /demo. Runs after both the
// production build and the viewer build in `npm run build`.
import { mkdirSync, copyFileSync } from 'node:fs'

mkdirSync('dist/demo', { recursive: true })
copyFileSync('dist-viewer/index.viewer.html', 'dist/demo/index.html')
console.log('Placed self-contained demo at dist/demo/index.html (served at /demo)')
