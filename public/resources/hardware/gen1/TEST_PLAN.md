# Physical validation plan

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


Every test below is **not run**. Automated software tests are separate and do not establish these results. Use run ID, date, operator, reviewer, drawing/firmware revision, instrument ID/calibration expiry, raw CSV/video reference, expected/observed result and pass/fail for each run. Retain failures and changes before retesting.

| Test | Method under approved supervision | Acceptance / evidence |
| --- | --- | --- |
| P01 inventory/budget | Reconcile actual invoices, shipping, tax and remaining contingency | <= AED10k, no battery, approved substitutions |
| P02 electrical design | Reviewer checks module cold Voc, protection, isolation, conductor and load ratings | Signed release before energization |
| P03 power measurement | Compare V/I/P at >=3 loads over safe module envelope | Target power error <=3% or <=2 W, whichever larger; record reference uncertainty |
| P04 temperature | Compare at >=3 safe temperatures | Target <=1.5 C including attachment method; no conflation of resolution and accuracy |
| P05 radiation | Co-planar comparison to calibrated reference over changing sun | Target <=10% over >=400 W/m²; log spectrum/tilt/cosine limitations; no ISO class claim |
| P06 flow | At least 3 weighed timed collections in calibrated operating range | Target <=10% or change sensor; do not apply 2–30 L/min spec below range |
| P07 water level | Fill measured tank volumes and trigger each band | Band transitions documented and repeatable; unavailable continuous reading remains null |
| P08 interlocks | Approved E-stop, leak, low level, sensor-loss, watchdog, power-loss tests | Pump/valve de-energize independently; target <=1 s from trip; no restart without local reset |
| P09 cycle timeout | Supervised request then hold/repeat request | <=30 s actuation, latched stop, no extension by repeated request |
| P10 no flow | Approved simulation of no-flow state without damaging pump | Stop after approved priming period, latched fault, no repeated dry runs |
| P11 data contract | Real frame + missing sensor, replay, ID mismatch, stale and inconsistent power | Correct rejection/status; no fake replacement readings |
| P12 telemetry soak | >=8 h supervised logging with known intentional interruptions | >=95% expected sample coverage excluding declared downtime; raw denominator retained |
| P13 cleaning comparison | Repeated matched irradiance/temp tests with manual control surface | Report distributions, water/aux energy, confidence and limitations; no saving claim on one run |
| P14 commercial outage | Certified EPC test only at later permitted field installation | Inverter anti-islanding per accepted procedure, no backup claim; excluded from lab scope |

A failed safety test blocks demonstrations. Performance tests below target require measurement review and may reduce claims rather than trigger unsafe modifications. Any grid/rooftop pilot requires a separate approved test plan.
