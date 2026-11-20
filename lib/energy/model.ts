/**
 * WELOS simplified energy models.
 *
 * Every number on the website that is not a cited study figure comes from these
 * functions. They are deliberately simple, physically grounded and documented —
 * suitable for explaining behaviour, NOT for sizing a real installation.
 */

export const CONST = {
  rhoAir: 1.225, // kg/m³ — dry air, 15 °C, sea level (ISA)
  rhoWater: 1000, // kg/m³
  g: 9.81, // m/s²
  stcIrradiance: 1000, // W/m² — PV standard test conditions
} as const;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ───────────────────────── SOLAR (PV) ───────────────────────── */

export type SolarParams = {
  irradiance: number; // plane-of-array irradiance, W/m²
  area: number; // module area, m²
  efficiency?: number; // module efficiency at STC (0–1)
  ambientC?: number; // ambient temperature, °C
  noctC?: number; // nominal operating cell temperature, °C
  tempCoeff?: number; // power temperature coefficient, 1/°C
  soilingLoss?: number; // fractional loss from dust (0–1)
  systemLoss?: number; // wiring + inverter + mismatch (0–1)
};

/**
 * PV DC→AC output using the NOCT cell-temperature model:
 *   Tc = Ta + (NOCT − 20)/800 · G
 *   P  = G · A · η · (1 + γ(Tc − 25)) · (1 − soiling) · (1 − systemLoss)
 */
export function solarPower(p: SolarParams) {
  const { irradiance: G, area: A } = p;
  const eta = p.efficiency ?? 0.21;
  const Ta = p.ambientC ?? 35;
  const noct = p.noctC ?? 45;
  const gamma = p.tempCoeff ?? -0.0035;
  const soiling = p.soilingLoss ?? 0;
  const sys = p.systemLoss ?? 0.14;
  const cellC = Ta + ((noct - 20) / 800) * G;
  const tempFactor = 1 + gamma * (cellC - 25);
  const watts = Math.max(0, G * A * eta * tempFactor * (1 - soiling) * (1 - sys));
  return {
    kW: watts / 1000,
    cellC,
    tempFactor,
    effectiveEfficiency: G > 0 ? watts / (G * A) : 0,
  };
}

/* ───────────────────────── WIND ───────────────────────── */

export type WindParams = {
  speed: number; // hub-height wind speed, m/s
  rotorDiameter?: number; // m
  cp?: number; // power coefficient (Betz limit 0.593)
  rho?: number; // air density, kg/m³
  cutIn?: number;
  rated?: number;
  cutOut?: number;
};

/**
 * Wind turbine output:
 *   P = ½ · ρ · A · v³ · Cp       for cut-in ≤ v < rated
 *   P = P(rated)                  for rated ≤ v < cut-out
 *   P = 0                         otherwise (idle / storm shutdown)
 */
export function windPower(p: WindParams) {
  const D = p.rotorDiameter ?? 8;
  const cp = p.cp ?? 0.38;
  const rho = p.rho ?? CONST.rhoAir;
  const cutIn = p.cutIn ?? 3;
  const rated = p.rated ?? 12;
  const cutOut = p.cutOut ?? 25;
  const A = Math.PI * (D / 2) ** 2;
  const raw = (v: number) => 0.5 * rho * A * v ** 3 * cp;
  const v = Math.max(0, p.speed);
  let watts = 0;
  let state: "idle" | "generating" | "rated" | "shutdown" = "idle";
  if (v >= cutOut) state = "shutdown";
  else if (v >= rated) { watts = raw(rated); state = "rated"; }
  else if (v >= cutIn) { watts = raw(v); state = "generating"; }
  return { kW: watts / 1000, sweptArea: A, state, availableKW: (0.5 * rho * A * v ** 3) / 1000 };
}

/* ───────────────────────── WATER (hydro) ───────────────────────── */

export type HydroParams = {
  flowLps: number; // volumetric flow, litres per second
  headM: number; // net head (or pressure head recovered), m
  efficiency?: number; // turbine + generator (0–1)
};

/** Hydropower: P = ρ · g · Q · H · η */
export function hydroPower(p: HydroParams) {
  const eta = p.efficiency ?? 0.6;
  const Q = Math.max(0, p.flowLps) / 1000; // m³/s
  const watts = CONST.rhoWater * CONST.g * Q * Math.max(0, p.headM) * eta;
  return { kW: watts / 1000, hydraulicKW: (CONST.rhoWater * CONST.g * Q * p.headM) / 1000 };
}

/**
 * Rainwater harvest from a roof and the (small) energy it could theoretically
 * yield falling through a downpipe — shown to keep water-energy claims honest.
 */
export function rainHarvest(roofM2: number, rainfallMm: number, runoffCoeff = 0.8, dropM = 12, eta = 0.6) {
  const m3 = roofM2 * (rainfallMm / 1000) * runoffCoeff;
  const kWh = (CONST.rhoWater * CONST.g * m3 * dropM * eta) / 3.6e6;
  return { m3, litres: m3 * 1000, kWh };
}

/* ───────────────────────── DAILY HYBRID SIMULATION ───────────────────────── */

export type Scenario = {
  solarPeak: number; // peak plane-of-array irradiance, W/m² (clear-sky UAE ≈ 950–1050)
  windMean: number; // daily mean hub-height wind speed, m/s
  waterFlow: number; // continuous flow through in-pipe turbine, L/s
  demandDaily: number; // site demand, kWh/day
  batteryKWh: number; // usable-rated battery capacity, kWh
};

export type SiteSpec = {
  pvAreaM2: number;
  turbines: number;
  rotorDiameter: number;
  hydroHeadM: number;
  ambientC: number;
  soilingLoss: number;
  batteryCRate: number; // max charge/discharge power as fraction of capacity per hour
  chargeEff: number;
  dischargeEff: number;
  socMin: number;
  socMax: number;
  gridKgPerKWh: number; // grid emission factor (assumption)
};

/** Reference hybrid site used by the dashboard. All values are assumptions. */
export const REFERENCE_SITE: SiteSpec = {
  pvAreaM2: 420, // ≈ 88 kWp at 21 %
  turbines: 2,
  rotorDiameter: 8,
  hydroHeadM: 30, // pressure head recovered in a water network (≈ 3 bar)
  ambientC: 34,
  soilingLoss: 0.04,
  batteryCRate: 0.5,
  chargeEff: 0.96,
  dischargeEff: 0.96,
  socMin: 0.1,
  socMax: 0.95,
  gridKgPerKWh: 0.4,
};

/** Normalised commercial demand shape (24 h, sums to 1). */
const DEMAND_SHAPE = (() => {
  const raw = Array.from({ length: 24 }, (_, h) => {
    const base = 0.45;
    const workday = h >= 8 && h <= 18 ? 0.55 * Math.sin((Math.PI * (h - 7)) / 12) + 0.35 : 0;
    const evening = 0.25 * Math.exp(-((h - 20) ** 2) / 6);
    return base + workday + evening;
  });
  const s = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / s);
})();

/** Clear-sky irradiance shape for an arid site (sunrise ≈ 06:00, sunset ≈ 18:00). */
export function irradianceAt(hour: number, peak: number) {
  const x = (hour - 6) / 12;
  if (x <= 0 || x >= 1) return 0;
  return peak * Math.pow(Math.sin(Math.PI * x), 1.25);
}

/** Diurnal wind: afternoon sea-breeze maximum around 15:00, calmer pre-dawn. */
export function windAt(hour: number, mean: number) {
  return Math.max(0, mean * (1 + 0.35 * Math.sin((2 * Math.PI * (hour - 9)) / 24)));
}

export type HourRow = {
  hour: number;
  label: string;
  solar: number;
  wind: number;
  water: number;
  demand: number;
  charge: number;
  discharge: number;
  gridImport: number;
  surplus: number;
  soc: number; // 0–100 %
};

export function simulateDay(sc: Scenario, site: SiteSpec = REFERENCE_SITE) {
  const cap = Math.max(0, sc.batteryKWh);
  const pMax = cap * site.batteryCRate;
  const lo = cap * site.socMin;
  const hi = cap * site.socMax;
  let soc = cap * 0.5;

  const step = (h: number): HourRow => {
    const G = irradianceAt(h + 0.5, sc.solarPeak);
    const solar = solarPower({ irradiance: G, area: site.pvAreaM2, ambientC: site.ambientC, soilingLoss: site.soilingLoss }).kW;
    const wind = site.turbines * windPower({ speed: windAt(h + 0.5, sc.windMean), rotorDiameter: site.rotorDiameter }).kW;
    const water = hydroPower({ flowLps: sc.waterFlow, headM: site.hydroHeadM }).kW;
    const demand = sc.demandDaily * DEMAND_SHAPE[h];
    const net = solar + wind + water - demand; // kWh over a 1 h step
    let charge = 0, discharge = 0, gridImport = 0, surplus = 0;
    if (net >= 0) {
      charge = Math.min(net, pMax, Math.max(0, (hi - soc) / site.chargeEff));
      soc += charge * site.chargeEff;
      surplus = net - charge;
    } else {
      const need = -net;
      discharge = Math.min(need, pMax, Math.max(0, (soc - lo) * site.dischargeEff));
      soc -= discharge / site.dischargeEff;
      gridImport = need - discharge;
    }
    return {
      hour: h,
      label: `${String(h).padStart(2, "0")}:00`,
      solar, wind, water, demand, charge, discharge, gridImport, surplus,
      soc: cap > 0 ? (soc / cap) * 100 : 0,
    };
  };

  // Day 1 warms the battery state up; day 2 is reported (quasi-steady state).
  for (let h = 0; h < 24; h++) step(h);
  const rows = Array.from({ length: 24 }, (_, h) => step(h));

  const sum = (k: keyof HourRow) => rows.reduce((a, r) => a + (r[k] as number), 0);
  const solar = sum("solar"), wind = sum("wind"), water = sum("water");
  const generation = solar + wind + water;
  const demand = sum("demand");
  const gridImport = sum("gridImport");
  const surplus = sum("surplus");
  const selfSufficiency = demand > 0 ? (demand - gridImport) / demand : 0;
  const renewableUsed = demand - gridImport;
  const co2AvoidedKg = (renewableUsed + surplus) * site.gridKgPerKWh;
  const minSoc = Math.min(...rows.map((r) => r.soc));
  const maxSoc = Math.max(...rows.map((r) => r.soc));
  const balance = generation - demand;

  return {
    rows,
    totals: { solar, wind, water, generation, demand, gridImport, surplus, renewableUsed, balance },
    selfSufficiency,
    co2AvoidedKg,
    battery: { capacity: cap, minSoc, maxSoc, endSoc: rows[23].soc, throughput: sum("discharge") },
  };
}

export const DEFAULT_SCENARIO: Scenario = {
  solarPeak: 950,
  windMean: 5,
  waterFlow: 20,
  demandDaily: 640,
  batteryKWh: 200,
};

export const fmt = {
  kW: (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)),
  kWh: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(2)} MWh` : `${v.toFixed(v >= 100 ? 0 : 1)} kWh`),
  pct: (v: number) => `${(v * 100).toFixed(0)}%`,
};
