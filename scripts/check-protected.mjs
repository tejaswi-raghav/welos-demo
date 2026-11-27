import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest = JSON.parse(fs.readFileSync('docs/integration/baseline-sha256.json'));
const allowed = new Set(['package.json', 'package-lock.json', 'vite.config.js', 'vercel.json', 'api/location.js', 'README.md']);
let failed = false;
for (const [path, hash] of Object.entries(manifest)) {
  if (allowed.has(path)) continue;
  if (!fs.existsSync(path) || crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex') !== hash) {
    console.error('Protected original changed:', path);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('Every protected original file matches the pre-integration SHA-256 baseline.');
