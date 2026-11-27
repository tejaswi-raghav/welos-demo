# Deployment identity verification

Read-only inspection on 27 November 2026:

- GitHub repository: https://github.com/tejaswi-raghav/welos-demo
- Vercel project: welos-demo, prj_XE2jQZ0Zs7FxzWcwxmjx44RD5AKP.
- Verified attached domain: https://welos-demo.vercel.app (no redirect, no branch-specific alias).
- Production READY deployment: welos-demo-jrdi7exyi-vo1d.vercel.app, base main commit 8dd0c65457308fe3fd0d2be43199fe37a63bad81.
- No hostname change is needed. No production deployment or settings mutation was performed.

The stale location API User-Agent and Referer now use the verified domain. Package metadata uses welos-demo. Consumer WELOS/welOS, logo files, historical context and compatibility keys/aliases stay unchanged. The audit found no current-target references requiring a blanket brand rename.

The existing GitHub Pages workflow deploys main and is preserved. New clean commercial routes use Vercel rewrites plus a local Vite development middleware. Static hosts without rewrites need equivalent exact routes; do not assume GitHub Pages provides those routes. Original showroom HTML routes continue to build.

PR review does not authorize merge or production deployment. A branch push can trigger the owner's already-configured Vercel preview integration; no deploy command is issued. Review protected UI manually in an available browser before merging because computer-use tools were unavailable during this run.
