# Premium commercial experience verification

Base: a8ab4e60b3e5556638cffd150fea99704e524c85. Branch: codex/premium-commercial-experience. Date:27November2026.

## Boundaries and changes

Existing Story, Explorer, Control OS, Product, sign-in/Owner OS, AI, shared UI styles, model geometry/camera choreography, simulations, sizing/economics, Gen1 adapter and firmware remain source-identical. No main-navbar item, homepage scene or camera choreography was changed. One exact existing-style footer link, authorized by the brief, is the sole showroom chrome addition. New compact navigation belongs only to the commercial entry.

New src/commercial modules implement:

- Prototype workbench reusing the original CAD factory in a separately owned Three.js scene. Component selection/picking, local highlight, assembly/exploded toggle, optional cleaning and real BOM totals. Battery/wind/grid-inverter geometry is masked on this scene only. A single visible CAD PV module remains a concept-scale reference, not the100W bench layout or certified hardware.
- Developer architectural fleet using reused PV geometry, controlled single/neighborhood/portfolio camera positions, capped12-building rendering and explicit scenario labels. No installation marker or count represents traction.
- Customer and developer models reusing existing PV sizing and monthly bill functions. India uses explicit all-in unit-rate and installed-cost inputs, normalized annual load and flat monthly resource proxy. Export and subsidy credits are zero there. UAE uses existing regional assumptions with site-specific Dubai approval gating. Maintenance, degradation and inverter replacement enter cash crossover; no financing or professional approval is inferred.
- Natural Earth public-domain geographic outlines with researched city selection, solar/resource basis, approval/partner constraints and economics reference. India5.0kWh/m²/day is a labeled editable planning assumption, not fetched weather.
- Guided eligibility filtering, separate funding types, status/deadline/source/date, missing facts and a focused program detail. No eligible=true decision or application submission exists.
- Editorial company/portfolio/roadmap/risk/valuation pathways, with no detailed company forecast, founder biography or investor download.
- Local printable development proposal and validated unsent inquiry draft. No CRM, email, investor authentication or lead-storage backend is claimed. GET/HEAD-only api/commercial-research returns allowlisted public curated records.

## Privacy changes

Former company forecasts, investor decks, founder narratives and application drafts were copied outside Git before current tracked/public copies were removed. Public export is an exact product/research allowlist and purges nonallowlisted files from its generated resource directory. Removed private-resource URLs receive explicit404 in dev/preview; Vercel has no global SPA fallback or rewrite to those paths. Existing demo login is never used as security.

This cannot retract prior public Git history, caches, downloads or older deployments. No history rewrite or production settings change was attempted. Public vendor-listing observations remain in the development BOM; they are not private accepted supplier quotations. Company-model library regression tests now use an explicitly synthetic fixture outside public builds.

## Automated verification

Baseline:77 tests and production build passed before edits. Final local suite:97 tests passed, zero failed. Added tests cover customer/developer math, billing inversion, maintenance/replacement/negative-benefit behavior, invalid inputs, exact BOM grouping and optional removal, research contracts, eligibility gaps/type distinctions, map projection, routes/aliases, inquiry validation, printable HTML escaping and public/private resource separation. CPU-only CAD tests prove masking affects only a newly constructed model and leaves original battery/wind assets and six modules intact. They do not prove GPU rendering.

The protected-file check removes only that exact footer-link insertion before comparing all original chrome bytes. All six original HTML routes remain served in both dev and built preview. All seven canonical premium routes plus five compatibility aliases are checked, including slash/query variants. Server rendering checks every canonical premium page and public document link. Production build and existing protected-file hash check are required before PR.

## Browser/visual limitation

Before implementation the computer-use browser selection timed out again, despite a bounded retry. No reliable baseline/new-page screenshots or browser interaction recordings were captured. No web screenshot or pixel-perfect assertion is fabricated. Server rendering, HTTP assertions, CPU geometry tests and source hashes do not replace actual WebGL/mobile/camera/keyboard visual review. Keep this PR draft until the owner can review those interactions in a working browser. Fallback content and controls remain available if WebGL cannot initialize.

Manual review checklist: original scroll/camera/Control/product/auth/OS/AI flows; new scene selection/explode/cleaning, drag and reset; fleet scale changes; all city markers via pointer and keyboard; mobile overflow/touch; eligibility profiles/empty/closed results; price/bill/replacement edits and exports; inquiry invalid email; real hardware snapshot null/stale/error states; removed private URLs404. No physical calibration, assembly or certified site acceptance is claimed.
