import fs from 'node:fs';
import path from 'node:path';
// Explicit allowlist. Private company/investor documents must never enter dist.
import { PUBLIC_RESOURCES } from '../src/commercial/public-resources.js';
const root = 'public/resources';
const allowed = new Set(PUBLIC_RESOURCES.map(file => path.join(root, file)));
if (fs.existsSync(root)) for (const entry of fs.readdirSync(root, { recursive: true })) {
  const file = path.join(root, entry);
  if (fs.statSync(file).isFile() && !allowed.has(file)) fs.unlinkSync(file);
}
for (const file of PUBLIC_RESOURCES) {
  const dest = path.join('public/resources', file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}
console.log('Exported allowlisted public product/research resources only; no investor model or founder material.');
