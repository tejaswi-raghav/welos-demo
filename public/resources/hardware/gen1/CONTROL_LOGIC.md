# Gen 1 control and firmware integration specification

Status: design/specification only, 27 November 2026. No physical prototype has been assembled, energized or tested. Independent engineering review is required before procurement release and assembly.


## Commercial power simulation

`dispatch()` computes PV AC available = PV DC × assumed inverter efficiency. Demand = building + controller + maintenance power. With grid available, PV first serves concurrent demand, remaining demand imports, approved surplus exports and all unapproved surplus curtails. With grid unavailable, delivery/import/export are zero, all demand is unserved and controller power is unavailable. This is an instantaneous synthetic model, distinct from the existing monthly bill model.

## Lab state machine to implement on hardware

STARTUP defaults actuator outputs off. Complete sensor plausibility and independent interlock checks, then enter READY. An explicitly supervised, locally armed request enters RINSE only with no E-stop/leak, calibrated level >=25%, temperature <=45 C, irradiance <=250 W/m², fresh sensor age <=5 s and connected local controller. The pure `rinsePolicy()` documents this envelope and fails closed for invalid readings. The firmware must additionally latch run start time, enforce maximum 30 s, detect no flow after priming, and require deliberate local reset. Repeated requests cannot extend a cycle. A browser cannot arm or bypass the chain.

INTERLOCK/FAULT drops actuator enable; NC valve closes. Loss of network cannot defeat a physical stop. Wi-Fi is optional for local logging. A watchdog resets outputs off. Reboot never resumes cleaning. Record fault time, reason, reset operator and firmware revision. Existing reference firmware remains unmodified because it models battery/BMS priority and cannot be flashed as a ready Gen1 controller without this port.

## Interface allocation for engineering review

I2C: INA260 pair at unique addresses using documented address jumpers. One-wire: individually identified temperature probes. UART: isolated 3.3 V RS485 SEN0640. Pulse GPIO: level-shifted SEN0217. Protected digital inputs: level bands and safety feedback. Default-low driver output: actuator-enable request. Exact ESP32 board pin numbers must be approved from its actual revision, excluding strapping/USB conflicts. No unreviewed pin map is claimed executable.

Publish source-tagged read-only JSON snapshots per telemetry contract. Do not put credentials in snapshots. Keep firmware logs separate from simulation fixtures.
