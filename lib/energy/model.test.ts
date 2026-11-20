import { test } from "node:test";
import assert from "node:assert/strict";
import { solarPower, windPower, hydroPower, rainHarvest, simulateDay, DEFAULT_SCENARIO } from "./model.ts";

test("PV at STC with no losses equals G·A·η corrected for cell temperature", () => {
  const r = solarPower({ irradiance: 1000, area: 10, efficiency: 0.2, ambientC: 25, noctC: 20, systemLoss: 0 });
  // NOCT 20 → cell = ambient = 25 °C → no temperature derate
  assert.ok(Math.abs(r.kW - 2) < 1e-9);
});

test("hot cells lose output", () => {
  const cool = solarPower({ irradiance: 900, area: 10, ambientC: 20 }).kW;
  const hot = solarPower({ irradiance: 900, area: 10, ambientC: 45 }).kW;
  assert.ok(hot < cool);
});

test("wind follows v³ below rated, flat at rated, zero past cut-out", () => {
  const a = windPower({ speed: 6 }).kW;
  const b = windPower({ speed: 3 * 2 }).kW;
  assert.equal(a, b);
  const r1 = windPower({ speed: 6 }).kW, r2 = windPower({ speed: 4 }).kW;
  assert.ok(Math.abs(r1 / r2 - (6 / 4) ** 3) < 1e-9);
  assert.equal(windPower({ speed: 15 }).kW, windPower({ speed: 12 }).kW);
  assert.equal(windPower({ speed: 26 }).kW, 0);
  assert.equal(windPower({ speed: 2 }).kW, 0);
});

test("hydro P = ρgQHη", () => {
  // 100 L/s through 10 m at 60 % → 1000·9.81·0.1·10·0.6 = 5886 W
  assert.ok(Math.abs(hydroPower({ flowLps: 100, headM: 10 }).kW - 5.886) < 1e-9);
});

test("rain harvest on a UAE roof is a water resource, not an energy one", () => {
  const r = rainHarvest(500, 110);
  assert.ok(Math.abs(r.m3 - 44) < 1e-9);
  assert.ok(r.kWh < 2);
});

test("daily simulation conserves energy", () => {
  const s = simulateDay(DEFAULT_SCENARIO);
  for (const r of s.rows) {
    const supply = r.solar + r.wind + r.water + r.discharge + r.gridImport;
    const use = r.demand + r.charge + r.surplus;
    assert.ok(Math.abs(supply - use) < 1e-9, `hour ${r.hour}`);
    assert.ok(r.soc >= 0 && r.soc <= 100);
  }
  assert.ok(s.selfSufficiency >= 0 && s.selfSufficiency <= 1);
});

test("zero battery means every deficit is imported", () => {
  const s = simulateDay({ ...DEFAULT_SCENARIO, batteryKWh: 0 });
  assert.equal(s.battery.throughput, 0);
});
