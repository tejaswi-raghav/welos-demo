# Assembly and demonstration sequence

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


No parts have been ordered or assembled by this change. This sequence requires qualified lab supervision and the signed safety design. It intentionally does not prescribe mains wiring or unreviewed power-circuit pin connections.

1. **Freeze scope and procurement.** Obtain actual quotes, lead times, module cold Voc data, pump/valve compatibility and instrumentation access. Reconcile the BOM and contingency. If over AED10k, simplify the fixed rinse demonstration or defer it; never remove independent protection/calibration to fit optional wind.
2. **Review design.** Qualified engineer approves schematics, actuator safety chain, mechanical frame and ingress/heat/containment plan. Record revision and open risks. No energization before sign-off.
3. **Assemble dry mechanics.** Ground-level frame, approved panel support, covered tank/tray, dry electronics enclosure, guarded electronic load and cable strain relief. Inspect every accessible edge and tip/overflow path.
4. **Integrate sensors with current-limited SELV supplies.** Check actual board voltages and interfaces against vendor datasheets. Firmware port needs explicit output-off startup, watchdog, timing latch and no-flow logic. Verify safety-chain function separately from software.
5. **Validate measurement chain.** Calibrate V/I/power against a reference meter, temperature probes at known points, tank level by measured fills, flow by weighed collection and irradiance against a calibrated reference. Record serial numbers and uncertainty.
6. **Wet test under supervision.** Isolate electrical load work; prove containment and stop behavior before rinsing a compatible sacrificial panel surface. Confirm valve closure, pump dry-run inhibition and no-flow stop. Do not perform fault tests beyond the approved lab risk assessment.
7. **Telemetry handover.** Capture real serial JSON, label device/time/calibration status, import into /prototype and verify stale/unavailable behavior. Browser interface is read-only and cannot command water equipment.
8. **Release demonstration.** Complete TEST_PLAN, sign acceptance, brief operator and post non-potable/no-backup boundaries. Store raw results under test-run identifier. No claimed energy recovery or product certification follows from a successful short bench demonstration.
