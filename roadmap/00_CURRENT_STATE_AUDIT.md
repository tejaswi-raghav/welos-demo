# Current-state audit

Assessment: 27 November 2026.

Baseline is `welos-demo/main` at `a8ab4e60b3e5556638cffd150fea99704e524c85`. Consult [repository documentation](../README.md), [integration audit](../docs/INTEGRATION_MAP.md), [business data](../business/data/), [Gen 1 engineering](../hardware/gen1/) and [firmware](../firmware/).

| Capability | Readiness | Evidence and reusable piece | Missing gate |
|---|---|---|---|
| Story, 3D Explorer, owner UI | Working prototype software | Built routes, deterministic assets, automated route and geometry checks | Real customer workflow, deployment support |
| Configurator and billing | Working prototype software | Tested sizing and economics functions | Compare field bills, installed quotes, local connection terms |
| Control OS and twin | Simulated | Separate policy and authored scenarios | Instrumented measurements, independent design review |
| Gen 1 hardware snapshots | Working prototype software | Timestamp, power and provenance validation | Actual firmware driver and calibrated sensor records |
| Reference firmware | Requires validation | ESP32 reference project and control interfaces | Build, flash and test a dedicated Gen 1 design under supervision |
| 100 W bench rig | Specified but not built | Requirements, public budget, test plan | Compatible parts, current quote, safety review, calibration |
| Utility connection | Unknown per site | Official approval pathways recorded | Site-level permission, EPC and approved equipment |
| Storage, wind and rinse in dry MVP | Not feasible within initial scope | Existing simulations remain available | Separate economic and approval evidence |
| Customers, paid revenue, grants, exact capital | Unknown | Pipeline templates only | Documentary proof and consent |
| Market/funding records | Requires validation | Dated official sources and historical program terms | Reconfirm intake, eligibility, price and jurisdiction |

No bill reduction, hardware performance or purchase readiness is inferred from demos. Customers cannot buy a validated commercial installation today because site agreements, supported data interfaces, measured effectiveness, service terms and approval pathways remain unresolved. Discontinue wet-loop and wind procurement for the first bench iteration. The most promising capability is permissioned read-only fault triage backed by auditable measurements.
