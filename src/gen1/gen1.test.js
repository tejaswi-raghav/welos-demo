import test from 'node:test';
import assert from 'node:assert/strict';
import { sizeGen1, readBuild } from './config.js';
import { dispatch, rinsePolicy } from './dispatch.js';
import { adaptTelemetry } from './telemetry.js';
import { sizeSystem } from '../site/sizing.js';
import { DEFAULT_REGION } from '../site/regions.js';
const sample = {
  schemaVersion: 1,
  source: 'hardware',
  deviceId: 'LAB_1',
  timestamp: '2026-11-27T10:00:00.000Z',
  pvVoltageV: 20,
  pvCurrentA: 2,
  pvPowerW: 40,
  temperatureC: 30,
  irradianceWm2: 500,
  waterLevelPct: 50,
  waterFlowLpm: 2,
  pumpState: false,
  controllerMode: 'READY',
  faults: [],
  connectivity: 'online'
};
const now = Date.parse(sample.timestamp) + 1000;
test('Gen1 uses approved sizing prices while force-excluding batteries and wind', () => {
  const gen = sizeGen1({
    exportApproved: true
  });
  const old = sizeSystem(DEFAULT_REGION.climate, 'S', {}, {
    battery: false,
    wind: false,
    cleaning: false,
    condensate: false,
    treatment: false
  }, 'solar-first', {
    utilityId: 'dewa',
    backup: false,
    waterSavings: false
  });
  assert.equal(gen.totals.totalAed, old.totals.totalAed);
  assert.equal(gen.totals.annualSavingsAed, old.totals.annualSavingsAed);
  assert.equal(gen.totals.storageKwh, 0);
  assert.equal(gen.totals.batteryCostAed, 0);
  assert.equal(gen.totals.backupHours, 0);
  assert.equal(gen.totals.withBattery, false);
  assert(!gen.components.some(c => c.id === 'battery' || c.id === 'wind'));
  assert.equal(gen.totals.waterSavingsAed, 0);
});
test('Unapproved exports never earn credits; Abu Dhabi remains gated even if caller requests approval', () => {
  const yes = sizeGen1({
      exportApproved: true
    }),
    no = sizeGen1();
  assert(yes.totals.annualSavingsAed >= no.totals.annualSavingsAed);
  assert.equal(no.exportApproved, false);
  assert.equal(sizeGen1({
    utilityId: 'taqa',
    exportApproved: true
  }).exportApproved, false);
  assert(no.monthly.every(m => m.batteryShift === 0));
});
test('Legacy saved packages retain aliases, choices and data, without mutation', () => {
  const old = {
    packageId: 'recommended',
    choices: {
      battery: true
    },
    owner: 'example'
  };
  const copy = structuredClone(old);
  const next = readBuild(old);
  assert.equal(next.packageId, 'complete');
  assert.equal(next.choices.battery, true);
  assert.deepEqual(old, copy);
  assert.equal(readBuild({
    configuration: 'core-gen1',
    choices: {
      battery: true,
      wind: true
    }
  }).choices.battery, false);
});
test('Grid dispatch conserves power across import, export, curtailment, demand and auxiliary power', () => {
  for (const pvDcW of [0, 100, 1000, 5000]) for (const buildingW of [0, 10, 1000, 6000]) for (const exportApproved of [false, true]) {
    const r = dispatch({
      pvDcW,
      buildingW,
      controllerW: 5,
      maintenanceW: 15,
      exportApproved
    });
    assert.equal(r.demandW, buildingW + 20);
    assert(Math.abs(r.pvAcAvailableW - r.pvUsedW - r.gridExportW - r.curtailedW) < 1e-8);
    assert.equal(r.servedW, r.demandW);
    assert.equal(r.gridImportW * r.gridExportW, 0);
    if (!exportApproved) assert.equal(r.gridExportW, 0);
    assert.equal(r.batteryChargeW + r.batteryDischargeW, 0);
  }
});
test('Outage shuts down PV delivery and controller; even sunlight cannot provide backup', () => {
  const r = dispatch({
    pvDcW: 5000,
    buildingW: 1000,
    gridAvailable: false,
    exportApproved: true
  });
  assert.equal(r.servedW, 0);
  assert.equal(r.unmetW, 1005);
  assert.equal(r.controllerPowered, false);
  assert.equal(r.backupHours, 0);
  assert.equal(r.gridExportW, 0);
  assert.throws(() => dispatch({
    buildingW: -1
  }));
  assert.throws(() => dispatch({
    inverterEfficiency: 2
  }));
});
test('Cleaning policy defaults off, times out and fails closed on stale/missing/unsafe readings', () => {
  const safe = {
    emergencyStop: false,
    leak: false,
    waterPct: 50,
    temperatureC: 30,
    irradianceWm2: 100,
    request: true,
    elapsedSeconds: 0,
    sampleAgeMs: 100,
    connected: true
  };
  assert.equal(rinsePolicy().pumpEnable, false);
  assert.equal(rinsePolicy(safe).pumpEnable, true);
  for (const patch of [{
    emergencyStop: true
  }, {
    leak: true
  }, {
    waterPct: 24
  }, {
    temperatureC: 46
  }, {
    irradianceWm2: 251
  }, {
    elapsedSeconds: 30
  }, {
    sampleAgeMs: 5001
  }, {
    connected: false
  }, {
    temperatureC: NaN
  }, {
    sampleAgeMs: -1
  }]) assert.equal(rinsePolicy({
    ...safe,
    ...patch
  }).pumpEnable, false);
});
test('Hardware adapter preserves zeros and unavailable readings and never labels import as authenticated live feed', () => {
  const r = adaptTelemetry({
    ...sample,
    pvVoltageV: 0,
    pvCurrentA: 0,
    pvPowerW: 0,
    waterFlowLpm: null
  }, {
    now
  });
  assert.equal(r.sensors.pvPowerW, 0);
  assert.equal(r.sensors.waterFlowLpm, null);
  assert(r.missing.includes('waterFlowLpm'));
  assert.equal(r.source, 'hardware');
  assert.equal(r.readOnly, true);
  assert.match(r.label, /snapshot/);
  assert.equal(adaptTelemetry(sample, {
    now: now + 6000
  }).connectivity, 'stale');
});
test('Hardware adapter rejects synthetic, replayed, wrong-device, malformed, future and inconsistent values', () => {
  for (const patch of [{
    source: 'simulation'
  }, {
    schemaVersion: 2
  }, {
    deviceId: '<script>'
  }, {
    pvPowerW: 70
  }, {
    pvVoltageV: -1
  }, {
    temperatureC: '30'
  }, {
    pumpState: 'false'
  }, {
    faults: 'none'
  }, {
    timestamp: '2027-01-01T00:00:00Z'
  }, {
    controllerMode: 'BATTERY_CHARGE'
  }, {
    waterFlowLpm: undefined
  }]) assert.throws(() => adaptTelemetry({
    ...sample,
    ...patch
  }, {
    now
  }));
  assert.throws(() => adaptTelemetry({ ...sample, timestamp: '2026-02-30T10:00:00Z' }, { now }));
  assert.throws(() => adaptTelemetry(sample, {
    now,
    expectedDeviceId: 'OTHER'
  }));
  assert.throws(() => adaptTelemetry(sample, {
    now,
    previousTimestamp: sample.timestamp
  }));
});
