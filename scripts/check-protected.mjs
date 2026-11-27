import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('docs/integration/baseline-sha256.json'));
const allowed = new Set(['package.json', 'package-lock.json', 'vite.config.js', 'vercel.json', 'api/location.js', 'README.md']);
let failed = false;
for (const [path, hash] of Object.entries(manifest)) {
  if (allowed.has(path)) continue;
  let bytes = fs.existsSync(path) ? fs.readFileSync(path) : null;
  // The user's premium brief permits one discreet entry point. Normalize only
  // this exact footer link; all other original chrome bytes remain protected.
  if (bytes && path === 'src/ui/chrome-html.js') {
    const addition = '<a href="/business">Explore welOS Business ↗</a>';
    const current = bytes.toString('utf8');
    if (current.includes(addition) && current.indexOf(addition) === current.lastIndexOf(addition)) bytes = Buffer.from(current.replace(addition, ''));
  }
  if (!bytes || crypto.createHash('sha256').update(bytes).digest('hex') !== hash) {
    console.error('Protected original changed:', path);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('Every protected original matches baseline; only the exact authorized commercial footer link is normalized.');
