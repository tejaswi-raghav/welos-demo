# Gen1 hardware snapshot contract v1

Transport today: manual import of a real serial/local-gateway JSON capture into /prototype. No network polling, remote actuation, cloud storage or authentication is implied. Do not transmit personal/device credentials in a frame. The browser never contacts an arbitrary user URL. Future gateways need device authentication, tenant authorization, TLS, replay sequencing and deployment-specific credential management.

`src/gen1/telemetry.js` validates the envelope, expected device ID, UTC time, monotonically increasing capture time for the active import session, scalar ranges, mode/fault/connectivity types and V×I/P consistency (5% or 2 W tolerance). It reports age and marks >5 s as stale. A user-editable device ID does not authenticate a sensor. UI explicitly calls the output an imported snapshot, even when fresh.

Required fields: schemaVersion=1, source=hardware, deviceId (1–64 alphanumeric/underscore/hyphen), timestamp UTC ISO string; pvVoltageV [0,30], pvCurrentA [0,10], pvPowerW [0,300], temperatureC [-20,100], irradianceWm2 [0,1800], waterLevelPct [0,100], waterFlowLpm [0,30], pumpState boolean, controllerMode STARTUP/READY/RINSE/INTERLOCK/FAULT/OFF, faults string array (<=32 codes, each <=100 characters), connectivity online/offline. All measured scalars and pumpState may be null for missing data. Never replace null with zero or synthetic values.

The electrical power envelope is a validation bound, not approval to exceed the selected load/panel ratings. Level percentage remains null until discrete bands/geometry support a calibrated conversion. Firmware should log band readings separately for traceability. SEN0640 is a photoelectric reference with spectral/cosine limitations, not an ISO-class pyranometer.

## Envelope template, not captured readings

Replace identity/time/mode with actual device output and measurements before use. Every sensor below is unavailable. This is documentation, not a live fixture.

```json
{
  "schemaVersion": 1,
  "source": "hardware",
  "deviceId": "REPLACE_WITH_DEVICE_ID",
  "timestamp": "REPLACE_WITH_ACTUAL_UTC_CAPTURE_TIME",
  "pvVoltageV": null,
  "pvCurrentA": null,
  "pvPowerW": null,
  "temperatureC": null,
  "irradianceWm2": null,
  "waterLevelPct": null,
  "waterFlowLpm": null,
  "pumpState": null,
  "controllerMode": "STARTUP",
  "faults": [],
  "connectivity": "offline"
}
```

Test fixtures containing numeric samples exist only inside the automated test file and are explicitly synthetic test inputs. The portal starts empty and never imports them.
