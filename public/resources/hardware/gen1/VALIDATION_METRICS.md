# Validation metrics and results register

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


All physical measurements: **unavailable**. No generated telemetry constitutes a test result.

| Metric | Definition / denominator | Target, not measured |
| --- | --- | --- |
| PV power error | abs(measured-reference), paired time/load points; report both W and % | <=max(2 W,3%) |
| Irradiance agreement | Paired co-planar samples above 400 W/m² against calibrated reference | <=10%, subject to uncertainty budget |
| Temperature agreement | Paired attached-probe/reference temperatures at three safe points | <=1.5 C |
| Flow volume error | abs(pulse volume - mass-derived volume) / reference volume | <=10% in actual calibrated range |
| Level detection | Actual volume at each discrete transition, with tank geometry | Repeatable bands, no invented continuous precision |
| Data coverage | Accepted distinct expected frames / scheduled expected frames | >=95% for 8 h supervised soak, declared downtime separate |
| Stop latency | Time from independent trip to measured actuator de-energization | <=1 s target; verify actual chain |
| Cycle limit | Actuator enable duration including repeated commands | <=30 s, no automatic restart |
| Cleaning net benefit | Matched PV energy change minus auxiliary energy, normalized to irradiance/temp | No positive target assumed |
| Water per cycle | Weighed delivered mass / water density, per actual cycle | Report measured L and uncertainty |
| Service usefulness | Actionable confirmed alerts / all alerts; time to resolution | Establish pilot baseline before setting SLA |

Calibration traceability, uncertainty, firmware revision and weather/context accompany every result. Vendor resolution is not measurement accuracy. Keep zero readings distinct from missing/null. Report failures, sample exclusion rules and observation duration. Site energy savings require measured bills/load/generation and valid counterfactual analysis; lab panel power cannot establish customer ROI.
