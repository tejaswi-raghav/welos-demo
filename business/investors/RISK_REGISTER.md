# Risk register

| Risk | Impact / current evidence | Mitigation / release gate | Workstream |
| --- | --- | --- | --- |
| Unsafe power/water interaction | Lab design only; no reviewed assembled rig | Qualified schematic/interlock review, contained water, sealed SELV supply, signed tests | Engineering |
| Sensor quality mistaken for accuracy | Low-cost photoelectric and pulse sensors have limitations | Reference calibration and explicit uncertainty/range; null missing data | Measurement |
| Grid compliance conflated with lab | No certified Welos installation | Licensed EPC, site approvals and separate inverter/anti-islanding certification | EPC/compliance |
| Battery-free backup misconception | Existing demo has storage | Separate configuration; zero backup and outage-unserved tests; preserve demo labels | Product |
| Firmware readiness overstated | Existing firmware battery-aware; no Gen1 port flashed | Verified pin map, drivers, timer/no-flow latch, watchdog, bench evidence | Embedded |
| Underbudget procurement | Public listings and ceilings, not accepted quotes | Three quotes, lead-time review,20% contingency and scope reduction before safety cuts | Procurement |
| Funding eligibility / expired calls | Founder entity/nationality unknown; SISFS expired | Program-specific check and dated source; no grant bookings | Founders |
| Policy/export assumptions | Abu Dhabi source conflict, Sharjah unverified | Zero-credit new planning by default; current written local approval | Market/compliance |
| Willingness to pay | No asserted customers/revenue |20 interviews, three price-tested pilots, actual paid renewals | Commercial |
| Weak unit economics/service burden | Scenario costs unvalidated | Actual invoice/COGS/CAC data, warranty reserve, service time tracking | Finance/operations |
| Working capital shortfall | Model exposes pre-financing cash deficits | Monthly treasury plan and signed funding before stock orders | Finance |
| Telemetry identity/privacy | Import validation is not authentication | Read-only local snapshot; production tenant auth/TLS/replay/data consent design | Software/security |
| IP/claims/partner status | Contributor rights/roles unknown; prospects only | Rights audit, verified bios, written contracts; no implied endorsements | Founders/legal |
| Valuation overreach | $100M ambition, no current valuation | Sensitivity assumptions, no fabricated market multiples; actual paid evidence | Finance |
| Protected UI regression | Original experience locked | SHA-256 manifest, existing tests, isolated routes and browser review where possible | Software |

No person is represented as a licensed engineer or legal adviser. Assign actual accountable owners and review dates during kickoff. Residual risk remains open until documentary evidence closes it.
