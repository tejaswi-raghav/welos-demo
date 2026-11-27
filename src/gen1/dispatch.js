const nonnegative = (x, key) => {
  if (!Number.isFinite(x) || x < 0) throw new RangeError(`${key} must be finite and non-negative`);
  return x;
};
/** Synthetic instantaneous AC power balance. Inverter efficiency is an explicit input. */
export function dispatch({
  pvDcW = 0,
  inverterEfficiency = 0.96,
  buildingW = 0,
  controllerW = 5,
  maintenanceW = 0,
  gridAvailable = true,
  exportApproved = false
} = {}) {
  for (const [k, v] of Object.entries({
    pvDcW,
    buildingW,
    controllerW,
    maintenanceW
  })) nonnegative(v, k);
  if (!Number.isFinite(inverterEfficiency) || inverterEfficiency < 0 || inverterEfficiency > 1) throw new RangeError('Invalid efficiency');
  if (typeof gridAvailable !== 'boolean' || typeof exportApproved !== 'boolean') throw new TypeError('Grid and export flags must be booleans');
  const demandW = buildingW + controllerW + maintenanceW;
  const pvAcAvailableW = pvDcW * inverterEfficiency;
  const pvUsedW = gridAvailable ? Math.min(pvAcAvailableW, demandW) : 0;
  const gridImportW = gridAvailable ? Math.max(0, demandW - pvUsedW) : 0;
  const gridExportW = gridAvailable && exportApproved ? Math.max(0, pvAcAvailableW - demandW) : 0;
  return {
    source: 'simulation',
    demandW,
    pvDcW,
    conversionLossW: pvDcW - pvAcAvailableW,
    pvAcAvailableW,
    pvUsedW,
    gridImportW,
    gridExportW,
    curtailedW: pvAcAvailableW - pvUsedW - gridExportW,
    servedW: pvUsedW + gridImportW,
    unmetW: gridAvailable ? 0 : demandW,
    storageKwh: 0,
    batteryChargeW: 0,
    batteryDischargeW: 0,
    backupHours: 0,
    controllerPowered: gridAvailable,
    mode: gridAvailable ? 'GRID_CONNECTED' : 'ANTI_ISLANDING_OFF'
  };
}
/** Lab advisory only. A hardwired interlock owns physical pump power. */
export function rinsePolicy({
  emergencyStop = true,
  leak = true,
  waterPct = 0,
  temperatureC = 100,
  irradianceWm2 = 1800,
  request = false,
  elapsedSeconds = 0,
  sampleAgeMs = Infinity,
  connected = false
} = {}) {
  const finite = [waterPct, temperatureC, irradianceWm2, elapsedSeconds, sampleAgeMs].every(Number.isFinite);
  const safe = finite && !emergencyStop && !leak && connected && sampleAgeMs >= 0 && sampleAgeMs <= 5000 && waterPct >= 25 && waterPct <= 100 && temperatureC <= 45 && temperatureC >= -10 && irradianceWm2 >= 0 && irradianceWm2 <= 250 && elapsedSeconds >= 0 && elapsedSeconds < 30;
  return {
    pumpEnable: safe && request === true,
    valveOpen: safe && request === true,
    mode: !safe ? 'INTERLOCK' : request ? 'RINSE' : 'READY',
    maxRunSeconds: 30,
    automaticRestart: false
  };
}
