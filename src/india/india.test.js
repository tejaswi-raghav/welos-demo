import test from "node:test";
import assert from "node:assert/strict";
import { CITIES, UTILITIES, SOURCES } from "./data.js";
import { evaluate, recommend, centralAssistance, incentives, normalise, generation, monthlyBill, resolveTariff, unitsFromBill, annualBills, priceEstimate, proposal, proposalHtml, isStale, changeCity, statuses } from "./engine.js";
import { serialise, parse, saveIndia, loadIndia, INDIA_KEY } from "./store.js";
import { matchPlace, detectPlace } from "./location.js";
import reverse from "../../api/reverse.js";

const YES = { connection: "yes", grid: "yes", dcr: "yes", vendor: "yes", noPrior: "yes" };
const delhi = { city: "delhi-ncr", utility: "brpl", monthlyKwh: 450, eligibility: YES };
const today = new Date("2026-11-28");

test("every city has twelve months of sun, known utilities and plausible yield", () => {
  assert.equal(CITIES.length, 10);
  for (const c of CITIES) {
    assert.equal(c.sun.ghi.length, 12); assert.equal(c.sun.temp.length, 12);
    const mean = c.sun.ghi.reduce((a, x, i) => a + x * [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i], 0) / 365;
    assert.ok(Math.abs(mean - c.sun.annual) < 0.05, `${c.id} monthly values match the annual value`);
    c.utilities.forEach((id) => assert.ok(UTILITIES[id], id));
    const g = generation(c.id, 1);
    assert.ok(g.annual > 1000 && g.annual < 1700, `${c.id} ${g.annual}`);
  }
  // BSES says 1 kWp makes about 100–120 units a month
  const g = generation("delhi-ncr", 1).annual / 12;
  assert.ok(g > 90 && g < 125, String(g));
});

test("central assistance follows the published slabs", () => {
  assert.deepEqual([1, 1.5, 2, 2.5, 3, 5, 10].map((kw) => centralAssistance(kw, "home")), [30000, 45000, 60000, 69000, 78000, 78000, 78000]);
  assert.equal(centralAssistance(100, "ghs", 20), 60 * 18000);
  assert.equal(centralAssistance(600, "ghs", 1000), 500 * 18000);
  assert.equal(centralAssistance(50, "commercial"), 0);
});

test("Delhi totals match the official worked table (2 kW ₹80,000; 3 kW ₹1,08,000)", () => {
  assert.equal(incentives(normalise({ ...delhi, kw: 2 })).deducted, 80000);
  assert.equal(incentives(normalise({ ...delhi, kw: 3 })).deducted, 108000);
  assert.equal(evaluate({ ...delhi, kw: 3 }, today).gross, 195000);
});

test("nothing is deducted until eligibility is confirmed", () => {
  const unsure = evaluate({ ...delhi, eligibility: {} }, today);
  assert.equal(unsure.incentives.status, "check"); assert.equal(unsure.netCost, unsure.gross); assert.equal(unsure.incentives.potential, 108000);
  const partial = evaluate({ ...delhi, eligibility: { connection: "yes", grid: "yes" } }, today);
  assert.equal(partial.incentives.deducted, 0);
  const no = evaluate({ ...delhi, eligibility: { ...YES, dcr: "no" } }, today);
  assert.equal(no.incentives.status, "ineligible"); assert.equal(no.netCost, no.gross);
  assert.equal(evaluate({ ...delhi, segment: "commercial", kw: 50 }, today).incentives.status, "none");
  assert.equal(evaluate({ ...delhi, product: "core" }, today).incentives.status, "none");
});

test("state subsidy applies only to Delhi utilities", () => {
  assert.equal(incentives(normalise({ ...delhi, utility: "ncr-other" })).state, 0);
  assert.equal(incentives(normalise({ city: "mumbai", utility: "adani", eligibility: YES })).state, 0);
});

test("Delhi slab bill, formula level", () => {
  const t = resolveTariff(normalise({ ...delhi, kw: 3, sanctionedKw: 3 }));
  assert.equal(monthlyBill(0, t), 150);
  assert.equal(monthlyBill(450, t), 200 * 3 + 200 * 4.5 + 50 * 6.5 + 150);
  assert.ok(Math.abs(unitsFromBill(monthlyBill(450, t), t) - 450) < 0.01);
});

test("Bengaluru bill and no borrowed Delhi rules", () => {
  const s = normalise({ city: "bengaluru", monthlyKwh: 200, kw: 3, sanctionedKw: 3 });
  assert.equal(s.utility, "bescom");
  assert.equal(monthlyBill(200, resolveTariff(s)), 200 * 5.8 + 450);
  const r = evaluate(s, today);
  assert.equal(r.economics.net, false); assert.equal(r.economics.settlement, 0);
});

test("incomplete tariff: no savings, a stated gap, then an explicit manual model", () => {
  for (const city of ["hyderabad", "mumbai", "chennai", "pune", "ahmedabad", "kolkata", "jaipur", "surat"]) {
    const r = evaluate({ city, monthlyKwh: 300 }, today);
    assert.equal(r.tariff, null, city); assert.equal(r.economics, null); assert.ok(r.gaps.length); assert.ok(r.generation.annual > 0);
    const manual = evaluate({ city, monthlyKwh: 300, flatRate: 7 }, today);
    assert.equal(manual.tariff.kind, "manual"); assert.ok(manual.economics.firstYear > 0);
  }
  assert.equal(evaluate({ city: "hyderabad", monthlyKwh: 300, utility: "brpl" }, today).utility, null);
});

test("commercial never silently uses the domestic tariff", () => {
  assert.equal(evaluate({ ...delhi, segment: "commercial", kw: 50 }, today).tariff, null);
});

test("monthly netting conserves energy and pays surplus only at the entered rate", () => {
  const tariff = { slabs: [[Infinity, 5]], fixed: 100, scale: 1, tax: 1 };
  const pv = Array(12).fill(400);
  const a = annualBills({ pv, loadMonthly: 300, tariff, net: true });
  assert.equal(a.surplusUnits, 1200); assert.equal(a.after, 1200); assert.equal(a.settlement, 0);
  assert.equal(annualBills({ pv, loadMonthly: 300, tariff, net: true, exportRate: 3 }).settlement, 3600);
  const b = annualBills({ pv, loadMonthly: 300, tariff, net: false, selfUsePct: 40 });
  assert.equal(b.selfUsed, 1440); assert.equal(b.imported, 2160); assert.equal(b.settlement, 0);
});

test("low and very high consumption behave", () => {
  const low = evaluate({ ...delhi, monthlyKwh: 20, kw: 10 }, today);
  assert.ok(low.economics.firstYear < 20 * 12 * 8); assert.ok(low.economics.after >= 12 * 150, "fixed charges remain");
  const high = evaluate({ ...delhi, monthlyKwh: 50000, kw: 10 }, today);
  assert.equal(high.economics.exported, 0); assert.ok(high.economics.payback > 0);
});

test("pricing: local indication in Delhi, labelled range elsewhere, no city multiplier", () => {
  assert.equal(priceEstimate(normalise({ ...delhi, kw: 8 })).perKw, 60000);
  const others = ["hyderabad", "mumbai", "chennai"].map((city) => priceEstimate(normalise({ city, kw: 3 })));
  assert.ok(others.every((p) => p.gross === others[0].gross && p.confidence.includes("pending") && p.low === 133200 && p.high === 195000));
  assert.equal(priceEstimate(normalise({ city: "pune", pricePerKw: 50000, kw: 4 })).gross, 200000);
});

test("missing price data and incompatible choices", () => {
  const core = evaluate({ city: "pune", product: "core" }, today);
  assert.equal(core.price.priced, false); assert.equal(core.netCost, null); assert.equal(core.generation, null); assert.equal(core.economics, null);
  assert.equal(normalise({ segment: "commercial", product: "solar" }).product, "commercial");
  assert.equal(normalise({ segment: "home", product: "commercial" }).product, "solar");
  assert.equal(evaluate({ city: "pune", kw: 5, roofM2: 20 }, today).roofOk, false);
});

test("battery-free everywhere", () => {
  const r = evaluate(delhi, today);
  assert.equal(r.batteryKwh, 0); assert.equal(r.backupHours, 0);
  assert.equal(serialise({ ...delhi, battery: true }).build.battery, undefined);
});

test("GBI is optional, time-limited and shown separately", () => {
  const a = evaluate(delhi, today), b = evaluate({ ...delhi, gbi: true }, today);
  assert.ok(Math.abs(b.economics.years[0].gbi - b.economics.pv * 3) < 1e-6);
  assert.equal(b.economics.years[5].gbi, 0); assert.ok(b.economics.lifetimeNet > a.economics.lifetimeNet);
  assert.equal(evaluate({ ...delhi, gbi: true }, new Date("2027-04-01")).economics.gbiOn, false);
});

test("sensitivity inputs move results the right way", () => {
  const base = evaluate(delhi, today).economics.lifetimeNet;
  assert.ok(evaluate({ ...delhi, tariffPct: 120 }, today).economics.lifetimeNet > base);
  assert.ok(evaluate({ ...delhi, solarPct: 80 }, today).economics.lifetimeNet < base);
  assert.ok(evaluate({ ...delhi, maintenanceInr: 3000 }, today).economics.lifetimeNet < base - 70000);
  assert.ok(evaluate({ ...delhi, pricePerKw: 80000 }, today).economics.lifetimeNet < base);
});

test("recommendation and proposal read the same calculation", () => {
  const list = recommend(delhi, today);
  assert.deepEqual(list.map((x) => x.id), ["upfront", "return", "larger"]);
  for (const x of list.filter((x) => x.patch)) {
    const r = evaluate({ ...delhi, ...x.patch }, today);
    assert.equal(r.economics.lifetimeNet, x.result.economics.lifetimeNet);
  }
  assert.notEqual(list.find((x) => x.id === "return").patch.kw, 10, "does not default to the biggest");
  const r = evaluate(delhi, today), rows = Object.fromEntries(proposal(r, today).rows);
  assert.equal(rows["Estimated net cost"], "₹87,000");
  assert.ok(proposalHtml(proposal(r, today)).includes("Not an installer quotation"));
  assert.equal(recommend({ ...delhi, existingSolar: true }, today)[0].patch.product, "core");
  assert.equal(recommend({ ...delhi, budgetInr: 1000 }, today)[0].id, "none");
});

test("every source id resolves and stale data is flagged", () => {
  for (const u of Object.values(UTILITIES)) for (const id of [u.tariff?.source, u.net?.source].filter(Boolean)) assert.ok(SOURCES[id]);
  assert.equal(isStale(today), false); assert.equal(isStale(new Date("2027-08-01")), true);
});

test("saved India builds are versioned and never touch the UAE key", () => {
  const mem = new Map([["welos.build.v1", '{"region":"dubai","battery":true}']]);
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  saveIndia({ ...delhi, lat: 28.6, battery: true }, storage);
  assert.equal(mem.get("welos.build.v1"), '{"region":"dubai","battery":true}');
  assert.ok(!mem.get(INDIA_KEY).includes('"lat"'));
  assert.equal(loadIndia(storage).city, "delhi-ncr");
  assert.equal(parse(mem.get("welos.build.v1")), null);
  assert.equal(parse('{"schema":99,"region":"IN","currency":"INR","build":{}}'), null);
  assert.equal(parse("nonsense"), null);
});

test("location matching", () => {
  const m = (p) => matchPlace(p);
  assert.deepEqual([m({ countryCode: "in", city: "Hyderabad", state: "Telangana" }).city, m({ countryCode: "in", city: "Hyderabad", state: "Telangana" }).confirmUtility], ["hyderabad", true]);
  assert.equal(m({ countryCode: "in", city: "Bangalore", state: "Karnataka" }).utility, "bescom");
  assert.equal(m({ countryCode: "in", city: "Gurugram", state: "Haryana" }).utility, "ncr-other");
  assert.equal(m({ countryCode: "ae", state: "Dubai" }).region, "dubai");
  assert.equal(m({ countryCode: "ae", state: "Abu Dhabi", city: "Al Ain" }).region, "al-ain");
  assert.equal(m({ countryCode: "in", city: "Lonavala", state: "Maharashtra", lat: 18.75, lon: 73.41 }).status, "nearby");
  assert.equal(m({ countryCode: "in", city: "Patna", state: "Bihar", lat: 25.6, lon: 85.1 }).status, "unsupported-city");
  assert.equal(m({ countryCode: "gb", city: "London" }).status, "unsupported-country");
});

test("location detection: rounding, denial, timeout and service failure", async () => {
  const ok = { getCurrentPosition: (s) => s({ coords: { latitude: 17.38512, longitude: 78.48671 } }) };
  let asked;
  const found = await detectPlace({ geolocation: ok, fetcher: async (u) => { asked = u; return { ok: true, json: async () => ({ place: { countryCode: "in", city: "Hyderabad", state: "Telangana" } }) }; } });
  assert.equal(asked, "/api/reverse?lat=17.39&lon=78.49"); assert.equal(found.city, "hyderabad");
  for (const [code, text] of [[1, /declined/], [3, /too long/], [2, /unavailable/]]) await assert.rejects(detectPlace({ geolocation: { getCurrentPosition: (_, f) => f({ code }) } }), text);
  await assert.rejects(detectPlace({ geolocation: ok, fetcher: async () => ({ ok: false }) }), /unavailable/);
  await assert.rejects(detectPlace({ geolocation: ok, fetcher: async () => { throw new Error("x"); } }), /did not respond/);
  await assert.rejects(detectPlace({ geolocation: null }), /cannot share/);
});

test("reverse API validates input, never caches, and reports upstream failure", async () => {
  const call = async (query) => { const out = { headers: {} }; const res = { setHeader: (k, v) => (out.headers[k] = v), status: (c) => { out.code = c; return res; }, json: (d) => { out.body = d; return out; } }; await reverse({ method: "GET", query }, res); return out; };
  assert.equal((await call({})).code, 400); assert.equal((await call({ lat: "99", lon: "0" })).code, 400);
  const real = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error("down"); };
    const bad = await call({ lat: "17.4", lon: "78.5" });
    assert.equal(bad.code, 502); assert.equal(bad.headers["Cache-Control"], "no-store");
  } finally { globalThis.fetch = real; }
});

test("changing city keeps property choices, clears place-bound figures and says so", () => {
  const { next, cleared } = changeCity({ ...delhi, kw: 5, roofM2: 60, flatRate: 8, pricePerKw: 50000 }, "chennai");
  assert.equal(next.city, "chennai"); assert.equal(next.utility, "tnpdcl");
  assert.equal(next.kw, 5); assert.equal(next.monthlyKwh, 450); assert.equal(next.roofM2, 60);
  assert.equal(next.flatRate, null); assert.equal(next.pricePerKw, null); assert.deepEqual(next.eligibility, {});
  assert.ok(cleared.includes("average tariff") && cleared.includes("subsidy eligibility answers"));
  assert.equal(changeCity(delhi, "delhi-ncr", "brpl").moved, false);
  const first = changeCity({ city: "mumbai", flatRate: 8 }, "mumbai", "adani");
  assert.equal(first.next.flatRate, 8, "first utility confirmation keeps entries");
});

test("price explorer states what is missing instead of guessing", () => {
  const h = statuses(evaluate({ city: "hyderabad" }, today));
  assert.deepEqual(h, ["Awaiting verified local prices", "Eligibility check required", "DISCOM selection required", "Consumption details required"]);
  assert.ok(!statuses(evaluate(delhi, today)).includes("Awaiting verified local prices"));
});

test("the bill without solar does not change with solar size", () => {
  const a = evaluate({ ...delhi, kw: 2 }, today), b = evaluate({ ...delhi, kw: 10 }, today);
  assert.equal(a.economics.before, b.economics.before); assert.equal(a.tariff.load, 3);
});
