// India economics. Pure functions over data.js. Separate from the UAE engine on purpose:
// different currency, tariffs, taxes, subsidy and settlement rules. No battery anywhere.
import { cityById, UTILITIES, PRICES, SUBSIDY_RULES, ELIGIBILITY, PRODUCTS, STALE_AFTER_DAYS, VERIFIED, DATA_VERSION, SOURCES } from "./data.js";

export const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FY = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // April → March
export const MODULE_W = 550;
export const M2_PER_KW = 8; // upper end of the 7–8 m² per kWp in the BSES FAQ
export const LIFE_YEARS = 25;
export const DEGRADATION = 0.005; // assumption, same as the UAE engine
export const GENERATION_BAND = 0.1; // planning band, an assumption rather than a measured error
export const ORIENTATION = Object.freeze({ south: 1, "south-east": 0.97, "south-west": 0.97, "east-west": 0.9, flat: 0.95 });
export const CAPACITIES = [2, 3, 5, 6, 10];
export const ASSUMED_LOAD_KW = 3; // sanctioned load used for fixed charges when none is entered

const num = (v, d = 0) => (v === "" || v == null || !Number.isFinite(Number(v)) ? d : Number(v));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const band = (bands, x) => (bands.find(([limit]) => x <= limit) || bands.at(-1))[1];
export const inr = (x) => `₹${Math.round(x).toLocaleString("en-IN")}`;
export const units = (x) => Math.round(x).toLocaleString("en-IN");
export const isStale = (today = new Date(), verified = VERIFIED) => (today - new Date(verified)) / 864e5 > STALE_AFTER_DAYS;

export const DEFAULTS = Object.freeze({
  city: "hyderabad", utility: null, segment: "home", product: "solar", kw: 3, monthlyKwh: null, billInr: null, usageMode: "units",
  roofM2: null, sanctionedKw: null, houses: 20, existingSolar: false, budgetInr: null,
  orientation: "south", shadingPct: 5, soilingPct: 4, eligibility: {}, gbi: false,
  flatRate: null, fixedMonthly: null, taxPct: 0, exportRate: null, selfUsePct: 40,
  pricePerKw: null, maintenanceInr: 0, inverterInr: 0, tariffPct: 100, solarPct: 100, consumptionPct: 100,
});
export function normalise(input = {}) {
  const s = { ...DEFAULTS, ...input, eligibility: { ...(input.eligibility || {}) } };
  if (!cityById[s.city]) s.city = DEFAULTS.city;
  const city = cityById[s.city];
  // A utility is never carried across cities. With several licensees the user must confirm one.
  if (!city.utilities.includes(s.utility)) s.utility = city.utilities.length === 1 ? city.utilities[0] : null;
  if (!["home", "ghs", "commercial"].includes(s.segment)) s.segment = "home";
  if (!PRODUCTS[s.product]?.segments.includes(s.segment)) s.product = s.segment === "commercial" ? "commercial" : "solar";
  const [min, max] = capacityRange(s.segment);
  s.kw = clamp(num(s.kw, 3), min, max);
  return s;
}
export const capacityRange = (segment) => (segment === "home" ? [1, 10] : [5, 500]);

/** Monthly generation in kWh from NASA horizontal irradiance. Tilt gain is not modelled. */
export function generation(cityId, kw, { orientation = "south", shadingPct = 5, soilingPct = 4, solarPct = 100 } = {}) {
  const { sun } = cityById[cityId];
  const months = sun.ghi.map((ghi, m) => {
    const thermal = 1 - 0.0035 * Math.max(0, sun.temp[m] + 22 - 25);
    const ratio = 0.86 * thermal * (ORIENTATION[orientation] ?? 1) * (1 - clamp(num(shadingPct), 0, 90) / 100) * (1 - clamp(num(soilingPct), 0, 50) / 100);
    return { kwh: kw * ghi * DAYS[m] * ratio * (num(solarPct, 100) / 100), ratio };
  });
  const annual = months.reduce((a, x) => a + x.kwh, 0);
  return { months: months.map((x) => x.kwh), annual, low: annual * (1 - GENERATION_BAND), high: annual * (1 + GENERATION_BAND),
    performanceRatio: months.reduce((a, x) => a + x.ratio, 0) / 12, perKw: kw ? annual / kw : 0 };
}

/** The tariff in force for this build, or null when we would have to guess. */
export function resolveTariff(s) {
  const utility = UTILITIES[s.utility];
  const scale = num(s.tariffPct, 100) / 100, tax = 1 + clamp(num(s.taxPct), 0, 50) / 100;
  const manualRate = num(s.flatRate, 0);
  if (manualRate > 0) return { kind: "manual", label: "Your average rate (simplified)", slabs: [[Infinity, manualRate]], fixed: Math.max(0, num(s.fixedMonthly)), scale, tax };
  // verified schedules are domestic only
  if (!utility?.tariff || s.segment !== "home") return null;
  const load = num(s.sanctionedKw, 0) || ASSUMED_LOAD_KW;
  return { kind: "published", label: utility.tariff.version, slabs: utility.tariff.slabs, fixed: band(utility.tariff.fixedBands, load) * load, load, scale, tax,
    source: utility.tariff.source, excludes: utility.tariff.excludes };
}

export function energyCharge(kwh, slabs) {
  let rest = Math.max(0, kwh), prev = 0, total = 0;
  for (const [limit, rate] of slabs) {
    const take = Math.min(rest, limit - prev);
    if (take <= 0) break;
    total += take * rate; rest -= take; prev = limit;
  }
  return total;
}
export const monthlyBill = (kwh, t) => (energyCharge(kwh, t.slabs) * t.scale + t.fixed) * t.tax;
/** Units that produce a given monthly bill. */
export function unitsFromBill(bill, t) {
  if (!(bill > monthlyBill(0, t))) return 0;
  let lo = 0, hi = 1;
  while (monthlyBill(hi, t) < bill && hi < 1e7) hi *= 2;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (monthlyBill(mid, t) < bill) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
export function consumption(s, tariff = resolveTariff(s)) {
  let base = null;
  if (s.usageMode === "bill") base = tariff && num(s.billInr) > 0 ? unitsFromBill(num(s.billInr), { ...tariff, scale: 1 }) : null;
  else if (num(s.monthlyKwh) > 0) base = num(s.monthlyKwh);
  return base == null ? null : base * (num(s.consumptionPct, 100) / 100);
}

/** One financial year of bills. Monthly netting where verified, otherwise self-use plus an entered export rate. */
export function annualBills({ pv, loadMonthly, tariff, net, exportRate = 0, selfUsePct = 40 }) {
  const months = [];
  let bank = 0;
  for (const m of FY) {
    const gen = pv[m], load = loadMonthly;
    let imported, exported, selfUsed, credit = 0;
    if (net) {
      selfUsed = Math.min(gen, load);
      exported = Math.max(0, gen - load);
      let deficit = Math.max(0, load - gen);
      bank += exported;
      credit = Math.min(bank, deficit); bank -= credit; deficit -= credit;
      imported = deficit;
    } else {
      selfUsed = Math.min(gen, load * clamp(num(selfUsePct, 40), 0, 100) / 100);
      exported = gen - selfUsed;
      imported = load - selfUsed;
    }
    const before = monthlyBill(load, tariff);
    const exportCredit = net ? 0 : exported * Math.max(0, num(exportRate));
    const after = monthlyBill(imported, tariff);
    months.push({ m, pv: gen, load, imported, exported, selfUsed, creditUsed: credit, before, after, exportCredit });
  }
  const sum = (k) => months.reduce((a, x) => a + x[k], 0);
  const settlement = net ? bank * Math.max(0, num(exportRate)) : sum("exportCredit");
  months.sort((a, b) => a.m - b.m);
  return { months, before: sum("before"), after: sum("after"), settlement, saving: sum("before") - sum("after") + settlement,
    pv: sum("pv"), selfUsed: sum("selfUsed"), exported: sum("exported"), imported: sum("imported"), surplusUnits: net ? bank : 0 };
}

export function priceEstimate(s) {
  const product = PRODUCTS[s.product], utility = UTILITIES[s.utility];
  if (!product.panels) return { priced: false, reason: "welOS Core has no verified price yet. We will not show a made-up one." };
  const residential = s.segment !== "commercial";
  const published = band(PRICES.delhiIndicative.bands, s.kw);
  const floor = residential ? PRICES.national.dcr : PRICES.national.nonDcr;
  let perKw, low, high, confidence, basis, sources;
  if (num(s.pricePerKw) > 0) {
    perKw = low = high = num(s.pricePerKw); confidence = "Your figure"; basis = "The installed cost per kW that you entered."; sources = [];
  } else if (utility?.delhi && residential) {
    perKw = high = published; low = Math.min(floor, published); confidence = "Published local indication"; sources = ["bsesFaq", "mercom"];
    basis = `Central figure: BSES Delhi indicative cost of ${inr(published)}/kW (${PRICES.delhiIndicative.dated}). Low end: national DCR average (${PRICES.national.dated}).`;
  } else {
    low = Math.min(floor, published); high = Math.max(floor, published); perKw = Math.round((low + high) / 2 / 100) * 100;
    confidence = "Indicative · city quote pending"; sources = ["mercom", "bsesFaq"];
    basis = `No verified local price. Range runs from the national ${residential ? "DCR" : "non-DCR"} average (${PRICES.national.dated}) to the Delhi indicative figure (${PRICES.delhiIndicative.dated}). The central value is the midpoint of that range, a model choice.`;
  }
  const gross = Math.round(perKw * s.kw);
  return { priced: true, perKw, gross, low: Math.round(low * s.kw), high: Math.round(high * s.kw), confidence, basis, sources, verified: PRICES.verified };
}

/** Itemised view. A single benchmark is never split into invented component prices. */
export function costLines(s, price = priceEstimate(s)) {
  const product = PRODUCTS[s.product];
  const lines = [];
  if (product.panels) lines.push(
    { label: "Grid-tied solar system, installed", detail: "Modules, inverter, mounting, protection, cabling, earthing, surge protection, labour, survey, commissioning. The source gives one installed figure, so these are not priced separately.", amount: price.gross ?? null, note: price.priced ? price.confidence : "Not priced" },
    { label: "Taxes, net-meter and utility fees", detail: "The benchmarks do not say what they include. Confirm GST, meter and application fees in a written quote.", amount: null, note: "Confirm in quote" },
  );
  if (product.intelligence) lines.push({ label: "welOS controller and monitoring", detail: "Hardware, connectivity and setup. Not subsidised.", amount: null, note: "Not yet priced" },
    { label: "welOS service fee (recurring)", detail: "Kept separate from one-time cost.", amount: null, note: "Not yet priced" });
  return lines;
}

export function centralAssistance(kw, segment, houses = 0) {
  const r = SUBSIDY_RULES.central;
  if (segment === "commercial") return 0;
  if (segment === "ghs") return Math.round(Math.min(kw, r.ghsMaxKw, Math.max(0, houses) * r.ghsKwPerHouse) * r.ghsRate);
  return Math.round(Math.min(kw, r.firstKw) * r.firstRate + clamp(kw - r.firstKw, 0, r.nextKw) * r.nextRate);
}

/** status: "estimated" (all conditions confirmed) | "check" (not yet) | "ineligible" | "none". */
export function incentives(s) {
  const product = PRODUCTS[s.product], utility = UTILITIES[s.utility];
  if (!product.panels) return { status: "none", reason: "Monitoring hardware on an existing system is not a subsidised installation.", central: 0, state: 0, potential: 0, deducted: 0, missing: [] };
  if (s.segment === "commercial") return { status: "none", reason: "The residential central subsidy does not apply to commercial connections.", central: 0, state: 0, potential: 0, deducted: 0, missing: [] };
  const central = centralAssistance(s.kw, s.segment, num(s.houses));
  let state = 0;
  if (utility?.delhi) {
    const d = SUBSIDY_RULES.delhiCapital;
    state = s.segment === "home" ? Math.min(d.cap, Math.round(s.kw * d.perKw)) : Math.round(Math.min(s.kw, num(s.houses) * 3, 500) * d.ghsPerKw);
  }
  const answers = ELIGIBILITY.map(([id, label]) => ({ id, label, answer: s.eligibility[id] || "unsure" }));
  const status = answers.some((a) => a.answer === "no") ? "ineligible" : answers.every((a) => a.answer === "yes") ? "estimated" : "check";
  const potential = central + state;
  return { status, central: status === "ineligible" ? 0 : central, state: status === "ineligible" ? 0 : state, potential: status === "ineligible" ? 0 : potential,
    deducted: status === "estimated" ? potential : 0, missing: answers.filter((a) => a.answer !== "yes").map((a) => a.label),
    reason: status === "estimated" ? "Estimated from your answers. It is paid only after approval, commissioning and a claim." : status === "ineligible" ? "One condition is not met, so nothing is deducted." : "Eligibility check required. Nothing is deducted yet." };
}

export function gbiRate(kw) { return (SUBSIDY_RULES.delhiGbi.bands.find(([limit]) => kw <= limit) || [])[1] ?? 0; }

/** The one calculation every page, chart, download and recommendation reads from. */
export function evaluate(input, today = new Date()) {
  const s = normalise(input);
  const city = cityById[s.city], utility = UTILITIES[s.utility] || null, product = PRODUCTS[s.product];
  const price = priceEstimate(s);
  const aid = incentives(s);
  const net = utility?.net?.type === "net" && s.segment === "home";
  const tariff = resolveTariff(s);
  const gen = product.panels ? generation(s.city, s.kw, s) : null;
  const load = consumption(s, tariff);
  const gross = price.priced ? price.gross : null;
  const netCost = gross == null ? null : gross - aid.deducted;
  const roofNeeded = product.panels ? s.kw * M2_PER_KW : 0;
  const roofOk = !num(s.roofM2) || !product.panels ? null : num(s.roofM2) >= roofNeeded;

  const gaps = [];
  if (!s.utility) gaps.push("Confirm your electricity utility");
  if (product.panels && !tariff) gaps.push(s.utility ? `Enter your average rate: no verified ${s.segment === "home" ? "domestic schedule" : "tariff for this category"} for ${utility.name}` : "Or enter your average rate");
  if (product.panels && load == null) gaps.push(s.usageMode === "bill" && !tariff ? "A bill amount needs a tariff first" : "Enter your electricity use");

  let economics = null;
  if (product.panels && tariff && load != null) {
    const gbiOn = s.gbi && utility?.delhi && s.segment === "home" && gbiRate(s.kw) > 0 && today <= new Date(SUBSIDY_RULES.delhiGbi.to);
    const years = [];
    let cumulative = -netCost, payback = null, first = null;
    for (let y = 1; y <= LIFE_YEARS; y++) {
      const age = (1 - DEGRADATION) ** (y - 1);
      const bills = annualBills({ pv: gen.months.map((x) => x * age), loadMonthly: load, tariff, net, exportRate: s.exportRate, selfUsePct: s.selfUsePct });
      if (!first) first = bills;
      const gbi = gbiOn && y <= SUBSIDY_RULES.delhiGbi.years ? bills.pv * gbiRate(s.kw) : 0;
      const cost = Math.max(0, num(s.maintenanceInr)) + (y === 12 ? Math.max(0, num(s.inverterInr)) : 0);
      const flow = bills.saving + gbi - cost;
      const before = cumulative;
      cumulative += flow;
      if (payback == null && before < 0 && cumulative >= 0) payback = y - 1 + -before / flow;
      years.push({ year: y, saving: bills.saving, gbi, cost, flow, cumulative });
    }
    economics = { ...first, load, net, gbiOn, years, firstYear: years[0].flow, payback, lifetimeNet: cumulative };
  }
  return { version: DATA_VERSION, input: s, city, utility, product, price, incentives: aid, tariff, generation: gen, load, gross, netCost, economics, gaps,
    roofNeeded, roofOk, modules: product.panels ? Math.ceil((s.kw * 1000) / MODULE_W) : 0, stale: isStale(today), batteryKwh: 0, backupHours: 0 };
}

/** Recommendations by stated objective. Never "the most expensive one". */
export function recommend(input, today = new Date()) {
  const s = normalise(input);
  const out = [];
  if (s.existingSolar) {
    out.push({ id: "retrofit", title: "Monitoring retrofit", patch: { product: "core" }, why: "You already have solar. welOS Core adds monitoring without new panels. Compatibility and price are still to be confirmed." });
    return out;
  }
  const product = s.segment === "commercial" ? "commercial" : s.product === "core" ? "solar" : s.product;
  const [min, max] = capacityRange(s.segment);
  const roofMax = num(s.roofM2) > 0 ? Math.floor((num(s.roofM2) / M2_PER_KW) * 10) / 10 : max;
  const sizes = (s.segment === "home" ? [1, 2, 3, 4, 5, 6, 8, 10] : [5, 10, 20, 30, 50, 100, 200, 500]).filter((k) => k >= min && k <= Math.min(max, roofMax));
  const all = sizes.map((kw) => evaluate({ ...s, kw, product }, today));
  const budget = num(s.budgetInr);
  const fits = all.filter((r) => !budget || (r.netCost != null && r.gross <= budget));
  if (!fits.length) return [{ id: "none", title: "No size fits yet", patch: null, why: !sizes.length ? `A ${min} kW system needs about ${min * M2_PER_KW} m² of shade-free roof.` : "Every size costs more than your budget before any subsidy." }];
  const low = fits[0];
  out.push({ id: "upfront", title: "Lowest upfront cost", patch: { kw: low.input.kw, product }, result: low, why: `${low.input.kw} kW is the smallest size that fits: about ${inr(low.gross)} before incentives.` });
  const paying = fits.filter((r) => r.economics);
  if (paying.length) {
    const best = paying.reduce((a, b) => (b.economics.lifetimeNet > a.economics.lifetimeNet ? b : a));
    if (best.economics.lifetimeNet > 0) out.push({ id: "return", title: "Strongest modelled return", patch: { kw: best.input.kw, product }, result: best, why: `${best.input.kw} kW gives the highest ${LIFE_YEARS}-year net of the sizes tested: ${inr(best.economics.lifetimeNet)} under the assumptions shown.` });
    else out.push({ id: "return", title: "No size pays back", patch: null, why: `Under the current assumptions no tested size recovers its cost in ${LIFE_YEARS} years.` });
  } else out.push({ id: "return", title: "Economic return", patch: null, why: "Needs your electricity use and a tariff before we can compare returns." });
  const big = fits.at(-1);
  if (big !== low) out.push({ id: "larger", title: "Larger capacity", patch: { kw: big.input.kw, product }, result: big, why: `${big.input.kw} kW is the largest tested size within your roof and budget. Subject to a site survey and utility approval.` });
  return out;
}

/** Self-contained proposal data, taken from evaluate() so it cannot disagree with the page. */
export function proposal(result, today = new Date()) {
  const r = result, e = r.economics, s = r.input;
  const sourceIds = new Set(["nasa", "portal", ...(r.price.sources || []), ...(r.tariff?.source ? [r.tariff.source] : []), ...(r.incentives.status !== "none" ? ["bsesFaq"] : [])]);
  return {
    title: `${r.product.name}, ${r.city.name}`, generated: today.toISOString().slice(0, 10), dataVersion: r.version,
    status: "Indicative model. Not an installer quotation, engineering design or subsidy approval.",
    rows: [
      ["City and utility", `${r.city.name} · ${r.utility?.name || "utility not confirmed"}`],
      ["Property", { home: "Individual home", ghs: "Group housing society (common supply)", commercial: "Commercial" }[s.segment]],
      ["Product", r.product.name], ["Battery", "None. No backup during a grid outage."],
      ...(r.product.panels ? [["Capacity", `${s.kw} kW, about ${r.modules} × ${MODULE_W} W modules (conceptual)`],
        ["Annual generation", `${units(r.generation.annual)} kWh (planning band ${units(r.generation.low)}–${units(r.generation.high)})`]] : []),
      ["Estimated installed cost", r.price.priced ? `${inr(r.gross)} (range ${inr(r.price.low)}–${inr(r.price.high)}) · ${r.price.confidence}` : r.price.reason],
      ["Central assistance", r.incentives.status === "estimated" ? inr(r.incentives.central) : r.incentives.reason],
      ...(r.incentives.state ? [["Delhi capital subsidy", r.incentives.status === "estimated" ? inr(r.incentives.state) : `${inr(r.incentives.state)} potential, not deducted`]] : []),
      ["Estimated net cost", r.netCost == null ? "Not priced" : inr(r.netCost)],
      ["Tariff", r.tariff ? r.tariff.label : "Missing: not modelled"],
      ["Year-one savings", e ? inr(e.firstYear) : `Not calculated: ${r.gaps.join("; ")}`],
      ["Simple payback", e?.payback ? `${e.payback.toFixed(1)} years` : "—"],
      [`${LIFE_YEARS}-year net`, e ? inr(e.lifetimeNet) : "—"],
    ],
    assumptions: [
      r.price.priced ? r.price.basis : r.price.reason,
      r.generation ? `Generation: NASA horizontal irradiance; ${s.orientation} orientation, ${s.shadingPct}% shading, ${s.soilingPct}% soiling, average performance ratio ${(r.generation.performanceRatio * 100).toFixed(0)}%. Tilt gain not modelled.` : "No generation is modelled for a monitoring retrofit.",
      r.tariff?.excludes ? `${r.tariff.excludes} Fixed charges use ${r.tariff.load} kW sanctioned load${num(s.sanctionedKw) ? "" : " (assumed)"}.` : r.tariff ? "Flat average rate entered by you; slabs and surcharges simplified." : "No tariff.",
      e?.net ? r.utility.net.note : `Export settlement unverified or not applied: ${s.selfUsePct}% of use assumed in daylight; exports valued at ₹${num(s.exportRate)}/kWh.`,
      `Output ageing ${DEGRADATION * 100}%/yr. Maintenance ${inr(num(s.maintenanceInr))}/yr; inverter replacement in year 12 ${inr(num(s.inverterInr))}. No financing, discounting or tariff escalation.`,
      "A grid-tied system without a battery generally provides no electricity during a grid outage.",
    ],
    sources: [...sourceIds].map((id) => SOURCES[id]),
  };
}
const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export function proposalHtml(p) {
  return `<!doctype html><html lang="en-IN"><meta charset="utf-8"><title>${esc(p.title)} · welOS proposal</title><style>body{font:15px/1.55 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#1d0d09}h1{margin:0}table{border-collapse:collapse;width:100%;margin:20px 0}td{border-bottom:1px solid #e8d8c9;padding:8px;vertical-align:top}td:first-child{width:36%;font-weight:600}.n{background:#fff5e6;border-left:4px solid #f47616;padding:10px 14px}li{margin-bottom:6px}</style>
<h1>${esc(p.title)}</h1><p>welOS · generated ${esc(p.generated)} · data ${esc(p.dataVersion)}</p><p class="n">${esc(p.status)}</p><table>${p.rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</table><h2>Assumptions</h2><ul>${p.assumptions.map((a) => `<li>${esc(a)}</li>`).join("")}</ul><h2>Sources</h2><ul>${p.sources.map((x) => `<li><a href="${esc(x.url)}">${esc(x.title)}</a></li>`).join("")}</ul></html>`;
}

const PLACE_BOUND = { sanctionedKw: "sanctioned load", flatRate: "average tariff", fixedMonthly: "fixed charge", taxPct: "tax on the bill", exportRate: "export rate", pricePerKw: "quoted price per kW", billInr: "bill amount" };
/** Move a build to another city or utility. Property choices stay; place-bound figures are cleared and named. */
export function changeCity(current, cityId, utility = null) {
  const prev = normalise(current);
  const next = normalise({ ...current, city: cityId, utility });
  const moved = prev.city !== next.city || Boolean(prev.utility && prev.utility !== next.utility);
  const cleared = [];
  if (moved) {
    for (const [key, label] of Object.entries(PLACE_BOUND)) {
      if (next[key] !== DEFAULTS[key] && next[key] !== "") cleared.push(label);
      next[key] = DEFAULTS[key];
    }
    if (Object.keys(next.eligibility).length) cleared.push("subsidy eligibility answers");
    next.eligibility = {}; next.gbi = false; next.tariffPct = 100;
  }
  return { next, cleared, moved };
}

/** What is still missing before a price card can be trusted. */
export function statuses(r) {
  const out = [];
  if (!r.price.priced || !r.utility?.delhi) out.push("Awaiting verified local prices");
  if (r.incentives.status === "check") out.push("Eligibility check required");
  if (!r.utility) out.push("DISCOM selection required");
  if (r.product.panels && r.load == null) out.push("Consumption details required");
  return out;
}
