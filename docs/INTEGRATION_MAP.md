# Integration map · 27 November 2026

Target: tejaswi-raghav/welos-demo. Base main: 8dd0c65457308fe3fd0d2be43199fe37a63bad81. Branch: codex/welos-business-integration.

## Audit before implementation

Reviewed home, explorer, control, product, os, site, twin, ui, ai, account, api, firmware, hardware and docs. Existing Vite multi-page application injects shared chrome through vite.config.js. The seven-scene home, 27-part model/topology, deterministic engine, sizing/economics, recommendations, owner OS, demo session and ESP32 reference firmware already exist. Product packages already support a Solar-first option and explicit battery exclusion. Existing economics uses monthly netting with a warm-up credit year; it is a planning model, not time-resolved physical self-consumption. Its Abu Dhabi export assumption must not become a new sales claim: current DoE guidance identifies a suspension. Existing approved calculation files stay unchanged.

| Capability | Integration decision |
| --- | --- |
| Home/Explorer/Control/OS/product/account/AI/model/twin/UI and assets | Preserve source bytes. No new imports or menu entries in these surfaces. |
| site/sizing.js, economics.js, regions.js, recommend.js | Read and reuse through src/gen1/config.js. Do not modify old package enumeration, aliases, saved-build keys, rates or calculations. |
| Battery-free instantaneous dispatch and fail-safe rinse policy | New src/gen1/ modules. Separate from the existing battery-aware controller and simulation. |
| Hardware readings | Versioned validated read-only JSON import adapter. No remote actuation or fabricated live feed. |
| Commercial research and company model | New business/data sources and isolated src/business portal. |
| Vite routes | Add one commercial HTML build entry and exact clean-route rewrites only. Original routes/chrome unchanged. |
| Identity | Package metadata and stale location API User-Agent/Referer only, using verified deployment hostname. |
| Firmware | Preserve reference firmware. Gen1 interface/specification is a new integration contract, not a claim of flashed hardware. |

## Baseline

Before code changes: all 62 existing Node tests pass; Vite production build passes (Vite 5.4.21). Logs retained in local work/baseline-tests.txt and baseline-build.txt. SHA-256 manifest records every original tracked file. Existing assets, UI, scenes, firmware and calculation modules will be checked against it.

Browser capture attempted before edits. Chrome provider unavailable; in-app browser and native Brave calls timed out, with native browser also reporting concurrent user changes. Baseline interaction recordings are therefore unavailable at this stage. Source-byte preservation plus existing regression tests are the deterministic protection; browser verification will be retried after implementation. This is not a claim of pixel-level visual certification.

## Deployment boundary

Read-only Vercel inspection found project welos-demo, production READY at base commit above, deployment welos-demo-jrdi7exyi-vo1d.vercel.app, under team_o95r9FabLB9mEujc0Wj99RqI. No production settings or deployments are changed. GitHub Pages existing workflow only deploys pushes to main; branch work does not trigger it. PR previews may be generated automatically by the owner's existing Vercel integration; no deploy command is authorized or issued.
