# Commercial foundation

The original website remains the showroom. Open `/business` for the isolated commercial portal, `/prototype` for Gen1 planning, `/markets`, `/partners`, `/incentives`, `/investors` and `/enterprise` for their respective tools. Existing navigation remains unchanged.

## Evidence and readiness

Software and planning only. No physical rig, certified installation, customer revenue, pilot contract, confirmed distribution partner or government award is asserted. The founders report AED10k BITS Pilani support; obtain receipt, conditions and available balance. Nationalities, incorporation, roles, IP ownership and cap table remain unknown and appear as gaps in application drafts.

## Single sources of truth

- `data/sources.json`: dated official-source register and limits.
- `data/incentives.json`: program type, eligibility, incorporation, status, deadline, evidence and next step.
- `data/markets.json`: nine-city market-entry comparison.
- `data/prototype.json`: engineering procurement ceilings and real supplier references.
- `data/finance-assumptions.json`: editable company model assumptions, all three cases.
- `../src/business/finance.js`: shared company forecast and valuation sensitivity functions, used by browser and CSV exporter.
- `../src/gen1/`: isolated battery-free pricing adapter, synthetic dispatch and read-only telemetry.

Run `npm run export:business` after updating research/documents. This recalculates all three CSV forecasts and copies canonical resources into `public/resources` for downloads. It does not modify current product economics. `npm run build` performs this export automatically through prebuild. Editing the browser model is local and ephemeral; download JSON to preserve a scenario.

Use the investor source deck and proposal as working materials with the stated limits. No application or partner outreach is submitted automatically. Do not assume an expired deadline remains open. Update research before a live proposal or application.
