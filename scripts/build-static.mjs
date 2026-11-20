// Builds a fully static export into /out (used for design previews and static hosts).
// API routes cannot be exported, so app/api is moved aside during the build.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const api = path.join(root, "app/api");
const parked = path.join(root, ".api-parked");
const moved = fs.existsSync(api);
// generated route types would still reference the parked API route
for (const d of [".next/types", ".next/dev/types"]) fs.rmSync(path.join(root, d), { recursive: true, force: true });
if (moved) fs.renameSync(api, parked);
try {
  execSync("npx next build", { cwd: root, stdio: "inherit", env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_STATIC_EXPORT: "1" } });
  // GitHub Pages: serve the _next folder (skip Jekyll processing)
  fs.writeFileSync(path.join(root, "out/.nojekyll"), "");
} finally {
  if (moved) fs.renameSync(parked, api);
}
