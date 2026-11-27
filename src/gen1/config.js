import { sizeSystem, packageKey } from '../site/sizing.js';
import { UTILITIES, DEFAULT_REGION, REGIONS } from '../site/regions.js';
export const GEN1 = Object.freeze({
  id: 'core-gen1',
  name: 'welOS Core Gen 1',
  storageKwh: 0,
  batteryCostAed: 0,
  backupHours: 0
});

/** Reuse the approved sizing/bill engine. Export credits require explicit site approval. */
export function sizeGen1({
  climate,
  tierId = 'S',
  inputs = {},
  cleaning = false,
  utilityId = 'dewa',
  exportApproved = false,
  customer = 'expat'
} = {}) {
  // No-credit economics already exists for SEWA. Preserve the requested tariff by
  // rerunning the same economics engine below, rather than creating another bill model.
  const siteClimate = climate || REGIONS.find(region => region.utility === utilityId)?.climate || DEFAULT_REGION.climate;
  const result = sizeSystem(siteClimate, tierId, inputs, {
    battery: false,
    wind: false,
    cleaning,
    condensate: false,
    treatment: false
  }, 'solar-first', {
    utilityId,
    customer,
    backup: false,
    waterSavings: false
  });
  const utility = UTILITIES[utilityId] || UTILITIES.dewa;
  const eligible = exportApproved && utility.id === 'dewa';
  const economics = annualEconomics({
    pvMonthly: result.monthly.map(m => m.pv),
    loadMonthly: result.monthly.map(m => m.load),
    utility: {
      ...utility,
      netMetering: eligible ? 'yes' : 'unverified'
    },
    tierId,
    customer,
    batteryKwh: 0
  });
  const billBeforeAed = Math.round(economics.billBefore),
    billAfterAed = Math.round(economics.billAfter);
  const savings = billBeforeAed - billAfterAed;
  return {
    ...result,
    configuration: GEN1,
    exportApproved: eligible,
    economicsBasis: 'Existing monthly planning model; selfUsed is a billing proxy, not measured physical self-consumption. Unapproved exports receive zero credit.',
    components: result.components.filter(c => !['battery', 'wind'].includes(c.id)).map(c => c.id === 'inverter' ? { ...c, output: 'Solar to the building and approved grid connection; no storage or backup' } : c.id === 'controller' ? { ...c, output: 'Solar monitoring, diagnostics and optional maintenance. No battery actions.' } : c),
    monthly: economics.months,
    totals: {
      ...result.totals,
      storageKwh: 0,
      batteryCostAed: 0,
      withBattery: false,
      backupHours: 0,
      billBeforeAed,
      billAfterAed,
      electricitySavingsAed: savings,
      annualSavingsAed: savings,
      monthlySavingsAed: Math.round(savings / 12),
      importKwh: economics.imported,
      exportKwh: economics.exported,
      selfSufficiencyPct: (1 - economics.imported / Math.max(1, economics.load)) * 100,
      paybackYears: savings > 0 ? result.totals.totalAed / savings : null,
      electricityPaybackYears: savings > 0 ? result.totals.totalAed / savings : null,
      // The old 25-year display excludes O&M/replacements. Gen1 does not expose those headline figures.
      lifetimeElectricityAed: undefined,
      lifetimeWaterAed: undefined,
      lifetimeSavingsAed: undefined,
      lifetimeNetAed: undefined
    }
  };
}
import { annualEconomics } from '../site/economics.js';

/** New namespace only: never rewrite existing localStorage builds or package aliases. */
export function readBuild(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Build must be an object');
  if (value.configuration === GEN1.id) return {
    ...value,
    version: 1,
    choices: {
      ...value.choices,
      battery: false,
      wind: false
    },
    storageKwh: 0
  };
  return {
    ...value,
    packageId: packageKey(value.packageId)
  };
}
