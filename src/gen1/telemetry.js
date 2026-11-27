/** Read-only import contract. A valid envelope is not device authentication or calibration. */
export function adaptTelemetry(raw, {
  expectedDeviceId,
  previousTimestamp,
  now = Date.now()
} = {}) {
  const fail = m => {
    throw new TypeError(m);
  };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('Expected telemetry object');
  if (raw.schemaVersion !== 1 || raw.source !== 'hardware') fail('Expected schemaVersion 1 hardware envelope; simulation cannot enter the hardware channel');
  if (typeof raw.deviceId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(raw.deviceId)) fail('Invalid device identity');
  if (expectedDeviceId && raw.deviceId !== expectedDeviceId) fail('Unexpected device identity');
  if (typeof raw.timestamp !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(raw.timestamp)) fail('UTC timestamp required');
  const stamp = Date.parse(raw.timestamp);
  if (!Number.isFinite(stamp) || !Number.isFinite(now) || stamp > now + 5000) fail('Invalid or future sensor timestamp');
  if (new Date(stamp).toISOString().slice(0, 19) !== raw.timestamp.slice(0, 19)) fail('Invalid calendar timestamp');
  if (previousTimestamp && (!Number.isFinite(Date.parse(previousTimestamp)) || stamp <= Date.parse(previousTimestamp))) fail('Replayed or out-of-order frame');
  const ranges = {
    pvVoltageV: [0, 30],
    pvCurrentA: [0, 10],
    pvPowerW: [0, 300],
    temperatureC: [-20, 100],
    irradianceWm2: [0, 1800],
    waterLevelPct: [0, 100],
    waterFlowLpm: [0, 30]
  };
  const sensors = {};
  for (const [k, [lo, hi]] of Object.entries(ranges)) {
    const v = raw[k];
    if (v !== null && (!Number.isFinite(v) || v < lo || v > hi)) fail(`Invalid ${k}; use null for an unavailable measurement`);
    sensors[k] = v;
  }
  if (raw.pumpState !== null && typeof raw.pumpState !== 'boolean') fail('Invalid pumpState');
  if (!['STARTUP', 'READY', 'RINSE', 'INTERLOCK', 'FAULT', 'OFF'].includes(raw.controllerMode)) fail('Invalid controllerMode');
  if (!Array.isArray(raw.faults) || raw.faults.length > 32 || raw.faults.some(x => typeof x !== 'string' || x.length > 100)) fail('Invalid faults');
  if (!['online', 'offline'].includes(raw.connectivity)) fail('Invalid connectivity');
  if ([raw.pvVoltageV, raw.pvCurrentA, raw.pvPowerW].every(x => x !== null)) {
    const calculated = raw.pvVoltageV * raw.pvCurrentA;
    if (Math.abs(calculated - raw.pvPowerW) > Math.max(2, calculated * .05)) fail('PV voltage/current/power disagree by more than tolerance');
  }
  const ageMs = Math.max(0, now - stamp),
    missing = Object.keys(sensors).filter(k => sensors[k] === null);
  return {
    schemaVersion: 1,
    source: 'hardware',
    deviceId: raw.deviceId,
    timestamp: raw.timestamp,
    sensors,
    pumpState: raw.pumpState,
    controllerMode: raw.controllerMode,
    faults: [...raw.faults],
    connectivity: ageMs > 5000 ? 'stale' : raw.connectivity,
    ageMs,
    missing,
    label: 'Imported hardware snapshot · identity and calibration unverified',
    readOnly: true
  };
}
