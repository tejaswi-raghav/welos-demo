# Water demonstration

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


A covered 20 L non-potable recirculating tank feeds a strainer, submerged FIT0563 pump, flow sensor, normally closed valve and fixed rinse rail. Return water drains through an open air gap into the contained tank/tray. It has no connection to a drinking-water or building plumbing system and makes no treatment, condensate-recovery or rainwater-harvest performance claim.

FIT0563 manufacturer page lists 6–18 V DC, 0.8–15 W and 280–500 L/hour nominal capacity. Actual hose/valve/head losses must be measured. Operate at the chosen approved 12 V supply only after checking its particular pump variant. SEN0217 vendor accuracy applies over 2–30 L/min; its pulse output needs 3.3 V protection. Start with >=2 L/min through the actual loop. If that cannot be achieved, do not use its headline accuracy: select a suitable low-flow sensor within budget or use weighed timed collection as the reference and flag pulse-derived values unvalidated.

Three non-contact SEN0204 sensors provide discrete level bands at surveyed tank volumes. Record the actual band/uncertainty; report null for a continuous percentage until the conversion has calibration evidence. An independent low-level switch interrupts actuator enable even if software misreads the tank. Add independent leak inhibition and a manual accessible stop.

Pump-on with no measured flow after the engineer-approved priming interval must stop and latch a fault. Maximum lab run is 30 s, followed by inspection and deliberate reset. Avoid automatic repeat attempts. Valve closes and pump power drops on stale data, control reset, stop-chain interruption or power loss. Drain and clean the rig after demonstrations to manage stagnation; use no hazardous cleaners. No drinking-water claims, UV sterilization claims or measured water savings until relevant separate testing exists.

Sources: https://www.dfrobot.com/product-1710.html and https://www.dfrobot.com/product-1517.html (checked 2026-11-27).
