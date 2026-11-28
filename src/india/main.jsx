import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./shell.js";
import "../product/product.css";
import "./india.css";
import { useStage, useAnnotations } from "../twin/useStage.js";
import { simulateDay } from "../twin/sim.js";
import { cityById, UTILITIES, PRODUCTS, ELIGIBILITY, CAPABILITIES, FUTURE_MODULES, SOURCES, VERIFIED, DATA_VERSION, SUBSIDY_RULES } from "./data.js";
import { evaluate, recommend, proposal, proposalHtml, normalise, changeCity, capacityRange, priceEstimate, costLines, gbiRate, inr, units, MONTHS, CAPACITIES, DEFAULTS, MODULE_W, M2_PER_KW, LIFE_YEARS } from "./engine.js";
import { saveIndia, loadIndia } from "./store.js";
import { CityPicker, Locate } from "./picker.jsx";
import { MonthBars, Waterfall, Payback } from "./charts.jsx";

const VIEW_FRAME = simulateDay("clear").frames[58];
const POSES = { S: { pos: [13.5, 7, 16], target: [0.4, 0.4, 0], fov: 32 }, M: { pos: [22, 15, 26], target: [1, -0.5, -1.5], fov: 32 }, L: { pos: [26, 19, 30], target: [1, -0.8, -1.5], fov: 32 } };
const SEGMENTS = [["home", "Home", "Own connection"], ["ghs", "Housing society", "Common-area supply"], ["commercial", "Commercial", "Business supply"]];
const yrs = (x) => (x ? `${x.toFixed(1)} yrs` : "—");
const SHOWN_MAX = 66; // the shared canopy plus ten extra bays of six

function initial() {
  const saved = loadIndia();
  const asked = new URLSearchParams(location.search).get("city");
  let st = saved || { ...DEFAULTS, eligibility: {} }, chosen = !!saved;
  if (cityById[asked]) { st = chosen ? changeCity(st, asked, asked === st.city ? st.utility : null).next : normalise({ ...st, city: asked }); chosen = true; }
  return { st, chosen };
}

/** Show exactly as many modules as the capacity needs, using the shared rooftop twin. */
function useArray(stage, count) {
  useEffect(() => {
    if (!stage) return;
    stage.setFrame(VIEW_FRAME); stage.setFlows("off"); stage.setEnvironment(0, true); stage.setRim(0.8, true);
    stage.setModules({ wind: false, rinse: false, battery: false, water: false });
    // hidden from the first frame, without the studio's shrink animation
    Object.values(stage.KEY).flat().forEach((o) => { if (o.userData.visT === 0) o.userData.visV = 0; });
    (stage.KEY["wind-cable"] || []).forEach((o) => { o.visible = false; });
  }, [stage]);
  useEffect(() => {
    if (!stage) return;
    const bays = Math.max(0, Math.ceil(count / 6) - 1);
    stage.setBays(bays);
    stage.modules.forEach((g, i) => { g.visible = i < count; });
    (stage.baySlots || []).forEach((bay, b) => {
      const parts = bay.children[0].children; // frame, cell pairs
      for (let k = 0; k < 6; k++) { const show = 6 * (b + 1) + k < count; parts[2 * k].visible = show; parts[2 * k + 1].visible = show; }
    });
    stage.setPose(POSES[bays === 0 ? "S" : bays <= 2 ? "M" : "L"], 1200);
  }, [stage, count]);
}

function Num({ label, hint, unit, value, onChange, placeholder, min = 0, step = "any", max }) {
  return <label className="in-num"><span>{label}{hint && <small>{hint}</small>}</span><span className="st-in"><input type="number" inputMode="decimal" min={min} max={max} step={step} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} /><em>{unit}</em></span></label>;
}
function Step({ n, title, children }) {
  return <fieldset className="pd-field in-step"><legend className="t-label"><i>{String(n).padStart(2, "0")}</i>{title}</legend>{children}</fieldset>;
}

function India() {
  const [canvasRef, stage] = useStage({ env: "rooftop", orbit: true });
  const [{ st, chosen }, setBoth] = useState(initial);
  const [picker, setPicker] = useState(false);
  const [notice, setNotice] = useState(null);
  const annoRef = useRef(null);
  const set = (patch) => setBoth((b) => ({ ...b, st: { ...b.st, ...patch } }));
  const r = useMemo(() => evaluate(st), [st]);
  const s = r.input, city = r.city, product = r.product, e = r.economics, aid = r.incentives, utility = r.utility;
  const recs = useMemo(() => recommend(st), [st]);
  const quick = s.segment === "home" ? CAPACITIES : [10, 20, 50, 100, 200];
  const ladder = useMemo(() => (product.panels ? quick.map((kw) => evaluate({ ...st, kw })) : []), [st]);
  const doc = useMemo(() => proposal(r), [r]);

  const count = product.panels ? r.modules : 6;
  useArray(stage, Math.min(count, SHOWN_MAX));
  useEffect(() => { if (chosen) saveIndia(st); }, [st, chosen]);

  function pick(cityId, utilityId) {
    if (!chosen) { setBoth({ chosen: true, st: normalise({ ...st, city: cityId, utility: utilityId }) }); setNotice(null); }
    else {
      const { next, cleared, moved } = changeCity(st, cityId, utilityId);
      setBoth({ chosen: true, st: next });
      setNotice(moved ? `Updated to ${cityById[cityId].name}${next.utility ? ` · ${UTILITIES[next.utility].name}` : ""}. Property, product, size, roof and units used are kept.${cleared.length ? ` Cleared because they belonged to the previous place: ${cleared.join(", ")}.` : ""} Tariff, sunlight, subsidy rules and results are recalculated.` : null);
    }
    setPicker(false);
  }

  useEffect(() => {
    const chip = document.getElementById("loc-chip"); if (!chip) return undefined;
    chip.querySelector("span").textContent = chosen ? city.name : "Choose city";
    const open = () => setPicker(true);
    chip.addEventListener("click", open);
    return () => chip.removeEventListener("click", open);
  }, [chosen, city.name]);

  const annos = chosen && product.panels ? [
    { id: "a-pv", key: "pv-array", at: [2.9, 1.9, 1.75], title: `${s.kw} kW`, sub: `${r.modules} modules, conceptual` },
    { id: "a-batt", key: "power-cabinet", at: [1.2, -1.36, 1.97], title: "No battery", sub: "no backup in an outage", ghost: true },
  ] : chosen ? [{ id: "a-core", key: "power-cabinet", at: [1.2, -1.36, 1.97], title: "welOS Core", sub: "planned retrofit" }] : [];
  useAnnotations(stage, annoRef, annos);

  function download(kind) {
    const payload = { ...doc, inputs: s, lines: costLines(s, r.price), monthly: e ? e.months.map((m) => ({ month: MONTHS[m.m], generationKwh: Math.round(m.pv), useKwh: Math.round(m.load), billBeforeInr: Math.round(m.before), billAfterInr: Math.round(m.after) })) : null };
    const blob = kind === "html" ? new Blob([proposalHtml(doc)], { type: "text/html" }) : new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `welos-india-${city.id}-${product.id}${product.panels ? `-${s.kw}kw` : ""}.${kind}`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const [kwMin, kwMax] = capacityRange(s.segment);
  const needsRate = product.panels && (!r.tariff || r.tariff.kind === "manual") && !utility?.tariff;
  const ownRate = product.panels && !needsRate;
  const siteRate = priceEstimate({ ...s, pricePerKw: null });
  const sliders = [
    ["tariffPct", "Tariff energy rate", 60, 150, 5, 100, (v) => `${v}%`], ["consumptionPct", "Your consumption", 50, 150, 5, 100, (v) => `${v}%`], ["solarPct", "Sunlight and output", 70, 120, 5, 100, (v) => `${v}%`],
    ["pricePerKw", "Installed cost per kW", 25000, 90000, 100, siteRate.perKw, inr], ["soilingPct", "Soiling loss (cleaning)", 0, 25, 1, 4, (v) => `${v}%`], ["shadingPct", "Shading loss", 0, 40, 1, 5, (v) => `${v}%`],
    ["maintenanceInr", "Cleaning and maintenance a year", 0, Math.max(30000, Math.ceil(s.kw) * 2000), 500, 0, inr], ["inverterInr", "Inverter replacement, year 12", 0, Math.max(100000, Math.ceil(s.kw) * 10000), 1000, 0, inr],
  ];

  return (
    <div className="product india">
      <section className="pd-hero">
        <div className="pd-stage twin-stage">
          <i className="stage-sun" aria-hidden="true" />
          <canvas ref={canvasRef} aria-label={chosen && product.panels ? `Conceptual 3D rooftop with ${r.modules} modules for ${s.kw} kilowatts in ${city.name}` : "Conceptual 3D rooftop"} />
          <div className="annos" ref={annoRef} aria-hidden="true">{annos.map((a) => <div key={a.id} data-id={a.id} className={`dimtag ${a.ghost ? "ghost" : ""}`}><i /><div><b className="t-num">{a.title}</b><span>{a.sub}</span></div></div>)}</div>
          {stage === false && <div className="pd-nogl"><img src="/explore/ref-base.jpg" alt="" /></div>}
          <div className="pd-badges">
            <span className="mode-pill" data-mode="NORMAL"><i />Grid-tied · no battery</span>
            <span className="t-label">{chosen ? `${city.name} · ${utility?.name || "confirm utility"}` : "India · ₹"}</span>
          </div>
          <p className="pd-note t-fine">{!chosen ? "Illustrative rooftop. Choose a city to begin." : !product.panels ? "Existing array shown for illustration." : count > SHOWN_MAX ? `Showing ${SHOWN_MAX} of ${count} modules. Conceptual until a site survey.` : `${count} × ${MODULE_W} W modules. Conceptual until a site survey.`}</p>
        </div>

        <aside className="pd-buy" aria-label="Configure welOS in India">
          <p className="t-label">welOS India · battery-free</p>
          <h1 className="t-h1">{chosen ? city.name : "Solar for India,"}<span className="t-soft">{chosen ? ` ${product.panels ? "solar." : "retrofit."}` : " shown honestly."}</span></h1>
          <p className="pd-sub">{chosen ? product.line : "Grid-tied solar and monitoring in rupees. Every figure shows its source, and anything we could not verify says so."}</p>

          <Step n={1} title="Market">
            <div className="seg" role="group" aria-label="Market"><button type="button" aria-pressed="true">India · ₹</button><button type="button" aria-pressed="false" onClick={() => { location.href = "/product.html"; }}>UAE · AED</button></div>
          </Step>

          <Step n={2} title="City and utility">
            <div className="in-row"><button type="button" className={`btn btn--sm ${chosen ? "btn--line" : ""}`} onClick={() => setPicker(true)}>{chosen ? `${city.name}, ${city.state} · change` : "Choose your city"}</button></div>
            <Locate onConfirm={pick} onManual={() => setPicker(true)} />
            {notice && <p className="in-notice" role="status">{notice}</p>}
            {chosen && city.utilities.length > 1 && <label className="in-field"><span>Electricity utility {!s.utility && <em className="rec">Confirm</em>}</span><select value={s.utility || ""} onChange={(ev) => pick(city.id, ev.target.value || null)}><option value="">Select the name on your bill</option>{city.utilities.map((id) => <option key={id} value={id}>{UTILITIES[id].name}</option>)}</select></label>}
            {chosen && utility && <p className={`pd-net ${utility.tariff ? "" : "unverified"}`}><i />{utility.tariff ? `${utility.name}: domestic tariff on file (${utility.tariff.version}).` : `${utility.name}: no verified tariff on file. Enter your average rate in step 4.`}</p>}
          </Step>

          {!chosen ? <div className="pd-rec"><p className="t-label">Just comparing?</p><p className="t-fine">See battery-free packages and what is known for each city without configuring a property.</p><a className="btn btn--line btn--sm" href="/india-cities.html">Open the price explorer</a></div> : <>
          <Step n={3} title="Property">
            <div className="pd-opts three">{SEGMENTS.map(([id, l, sub]) => <button key={id} type="button" className="opt" aria-pressed={s.segment === id} onClick={() => { if (id !== s.segment) set({ segment: id, product: id === "commercial" ? "commercial" : s.product === "commercial" ? "solar" : s.product, kw: id === "home" ? 3 : 20, eligibility: {}, gbi: false }); }}><b>{l}</b><small>{sub}</small></button>)}</div>
            {s.segment === "ghs" && <div className="st-inputs"><Num label="Houses in the society" hint="Caps the common-area subsidy at 3 kW per house" unit="homes" value={st.houses} onChange={(v) => set({ houses: v })} step="1" /></div>}
            <label className="pd-switch"><button type="button" className="toggle" role="switch" aria-checked={s.existingSolar} onClick={() => set({ existingSolar: !s.existingSolar, product: !s.existingSolar ? "core" : s.segment === "commercial" ? "commercial" : "solar" })} /><span>This property already has solar</span></label>
          </Step>

          <Step n={4} title="Electricity use">
            {!product.panels ? <p className="t-fine">Not needed for a monitoring retrofit.</p> : <>
            <div className="seg" role="group" aria-label="How you know your use">{[["units", "Units (kWh)"], ["bill", "Bill amount (₹)"]].map(([id, l]) => <button key={id} type="button" aria-pressed={s.usageMode === id} onClick={() => set({ usageMode: id })}>{l}</button>)}</div>
            <div className="st-inputs">
              {s.usageMode === "units" ? <Num label="Average month" hint="Units on your bills" unit="kWh" value={st.monthlyKwh} onChange={(v) => set({ monthlyKwh: v })} placeholder="e.g. 350" />
                : <Num label="Average monthly bill" hint={r.tariff ? "Converted to units with your tariff" : "Needs a rate below"} unit="₹" value={st.billInr} onChange={(v) => set({ billInr: v })} placeholder="e.g. 2500" />}
              <Num label="Sanctioned load" hint="Optional; 3 kW assumed for fixed charges" unit="kW" value={st.sanctionedKw} onChange={(v) => set({ sanctionedKw: v })} />
              {needsRate && <><Num label="Your average rate" hint="From your bill: energy charge ÷ units" unit="₹/kWh" value={st.flatRate} onChange={(v) => set({ flatRate: v })} />
                <Num label="Fixed charges" hint="Per month, optional" unit="₹" value={st.fixedMonthly} onChange={(v) => set({ fixedMonthly: v })} />
                <Num label="Duty and taxes on bill" hint="Optional" unit="%" value={st.taxPct || null} onChange={(v) => set({ taxPct: v ?? 0 })} /></>}
              {!e?.net && <><Num label="Use during daylight" hint="Share of your use while the sun is up (assumption)" unit="%" value={st.selfUsePct} onChange={(v) => set({ selfUsePct: v })} max="100" />
                <Num label="Export credit" hint="Unverified here; ₹0 unless your utility confirms a rate" unit="₹/kWh" value={st.exportRate} onChange={(v) => set({ exportRate: v })} /></>}
              {e?.net && <Num label="Year-end surplus rate" hint="Regulator's average power purchase cost; ₹0 if unknown" unit="₹/kWh" value={st.exportRate} onChange={(v) => set({ exportRate: v })} />}
              {ownRate && <details className="in-more" open={Number(st.flatRate) > 0}><summary>Use my own rate instead of the published slabs</summary><div className="st-inputs"><Num label="Your average rate" hint="Leave empty to use published slabs" unit="₹/kWh" value={st.flatRate} onChange={(v) => set({ flatRate: v })} />{Number(st.flatRate) > 0 && <Num label="Fixed charges" hint="Per month" unit="₹" value={st.fixedMonthly} onChange={(v) => set({ fixedMonthly: v })} />}</div></details>}
            </div>
            {s.usageMode === "bill" && r.load != null && <p className="t-fine">That bill is about {units(r.load)} kWh a month.</p>}
            </>}
          </Step>

          <Step n={5} title="Roof">
            <div className="st-inputs"><Num label="Shade-free roof area" hint={`About ${M2_PER_KW} m² per kW`} unit="m²" value={st.roofM2} onChange={(v) => set({ roofM2: v })} /></div>
            {r.roofOk === false && <p className="pd-warnline">{s.kw} kW needs about {r.roofNeeded} m². Your roof entry fits about {Math.floor((s.roofM2 / M2_PER_KW) * 10) / 10} kW, subject to survey.</p>}
          </Step>

          <Step n={6} title="Product and size">
            <div className="pd-opts two">{Object.values(PRODUCTS).filter((p) => p.segments.includes(s.segment)).map((p) => <button key={p.id} type="button" className="opt" aria-pressed={product.id === p.id} onClick={() => set({ product: p.id })}><b>{p.name}</b><small>{p.suits}</small></button>)}</div>
            {product.panels && <>
              <div className="seg pd-pkg in-sizes" role="group" aria-label="Capacity">{quick.map((kw) => <button key={kw} type="button" aria-pressed={s.kw === kw} onClick={() => set({ kw })}>{kw} kW</button>)}</div>
              <label className="in-range"><span>Custom size <b className="t-num">{s.kw} kW</b></span><input type="range" className="range" min={kwMin} max={kwMax} step={s.segment === "home" ? 0.5 : 5} value={s.kw} onChange={(ev) => set({ kw: Number(ev.target.value) })} /></label>
            </>}
          </Step>

          {product.panels && s.segment !== "commercial" && <Step n={7} title="Subsidy eligibility">
            <ul className="in-elig">{ELIGIBILITY.map(([id, label]) => <li key={id}><span id={`el-${id}`}>{label}</span><div className="seg" role="group" aria-labelledby={`el-${id}`}>{["yes", "no", "unsure"].map((a) => <button key={a} type="button" aria-pressed={(s.eligibility[id] || "unsure") === a} onClick={() => set({ eligibility: { ...s.eligibility, [id]: a } })}>{a === "unsure" ? "Not sure" : a === "yes" ? "Yes" : "No"}</button>)}</div></li>)}</ul>
            {utility?.delhi && s.segment === "home" && gbiRate(s.kw) > 0 && <label className="pd-switch"><button type="button" className="toggle" role="switch" aria-checked={s.gbi} onClick={() => set({ gbi: !s.gbi })} /><span>Include Delhi's generation incentive (₹{gbiRate(s.kw)}/kWh for up to 5 years; scheme window ends {SUBSIDY_RULES.delhiGbi.to})</span></label>}
          </Step>}

          <section className="pd-price" aria-label="Costs, incentives and savings">
            <div><span className="t-label">{r.price.priced ? "Estimated installed cost" : "Price"}</span>
              {r.price.priced ? <><b className="t-num">{inr(r.gross)}</b><small>{r.price.low !== r.price.high ? `Range ${inr(r.price.low)} – ${inr(r.price.high)} before incentives · ` : ""}{r.price.confidence}. Not a quotation.</small></>
                : <><b className="in-pending">Pricing pending</b><small>{r.price.reason}</small></>}
            </div>
            {r.price.priced && <dl className="pd-money">
              {aid.central > 0 && <div><dt>Central assistance <em>PM Surya Ghar</em></dt><dd /><dd className="sum t-num">{aid.status === "estimated" ? `− ${inr(aid.central)}` : `${inr(aid.central)} possible`}</dd></div>}
              {aid.state > 0 && <div><dt>Delhi capital subsidy <em>credited via bill</em></dt><dd /><dd className="sum t-num">{aid.status === "estimated" ? `− ${inr(aid.state)}` : `${inr(aid.state)} possible`}</dd></div>}
              <div className="tot"><dt>{aid.status === "estimated" ? "Estimated net cost" : "Cost today"} <em>{aid.status === "estimated" ? "you pay in full first; subsidy follows" : "nothing deducted"}</em></dt><dd /><dd className="sum t-num">{inr(r.netCost)}</dd></div>
              <div><dt>Recurring fees <em>welOS service</em></dt><dd /><dd className="sum">{product.intelligence ? "Not yet priced" : "None"}</dd></div>
            </dl>}
            {product.panels && <p className={`in-status ${aid.status}`}>{aid.reason}</p>}
            {e ? <dl className="pd-kpis">
              <div><dt className="t-label">Year-one saving</dt><dd className="t-num">{inr(e.firstYear)}</dd><small>Bills {inr(e.before)} → {inr(e.after)} a year{e.settlement ? `, export ${inr(e.settlement)}` : ""}{e.years[0].gbi ? `, incentive ${inr(e.years[0].gbi)}` : ""}{e.years[0].cost ? `, less ${inr(e.years[0].cost)} upkeep` : ""}</small></div>
              <div><dt className="t-label">Simple payback</dt><dd className="t-num">{yrs(e.payback)}</dd><small>On {inr(r.netCost)}</small></div>
              <div><dt className="t-label">{LIFE_YEARS}-year net</dt><dd className={`t-num ${e.lifetimeNet < 0 ? "c-warn" : ""}`}>{inr(e.lifetimeNet)}</dd><small>No tariff rise, financing or discounting</small></div>
              <div><dt className="t-label">First-year output</dt><dd className="t-num">{units(r.generation.annual)}<small>kWh</small></dd><small>Planning band {units(r.generation.low)}–{units(r.generation.high)}</small></div>
            </dl> : product.panels ? <p className="pd-warnline"><b>Savings not calculated yet.</b> {r.gaps.join(". ")}.</p> : <p className="t-fine">Savings from monitoring are not modelled: there is no measured evidence yet.</p>}
            <p className="t-fine pd-caveat">Indicative model. {product.panels && (r.tariff?.excludes || (r.tariff ? "Your flat rate simplifies slabs and surcharges. " : ""))} A grid-tied system without a battery generally gives no electricity during a grid outage.</p>
            {r.stale && <p className="pd-warnline">This data was last verified on {VERIFIED}. Check current prices and rules.</p>}
          </section>

          <div className="pd-cta">
            <button type="button" className="btn" onClick={() => download("html")}>Download proposal <span className="arr" aria-hidden="true">↓</span></button>
            <button type="button" className="btn btn--line" onClick={() => download("json")}>Data (JSON)</button>
            <a className="btn btn--line" href="/india-cities.html">Compare cities</a>
          </div>
          </>}
        </aside>
      </section>

      <CityPicker open={picker} current={chosen ? city.id : null} onClose={() => setPicker(false)} onPick={pick} />

      {chosen && <>
      <section className="pd-sec" aria-labelledby="h-rec">
        <header><p className="t-label">01 · Recommendation</p><h2 id="h-rec" className="t-h2">Pick by what matters to you.</h2><p className="t-body">Sizes are tested against your property, roof, use, utility and budget. The biggest system is not assumed to be the best one.</p></header>
        <div className="st-inputs in-budget"><Num label="Budget before incentives" hint="Optional" unit="₹" value={st.budgetInr} onChange={(v) => set({ budgetInr: v })} /></div>
        <div className="addons">{recs.map((x) => <article key={x.id} className={`addon ${x.patch && Object.entries(x.patch).every(([k, v]) => s[k] === v) ? "on" : ""}`}>
          <p className="t-label">{x.title}</p>
          {x.result && <p className="in-big t-num">{x.result.input.kw} kW<small>{inr(x.result.gross)} before incentives{x.result.economics ? ` · payback ${yrs(x.result.economics.payback)}` : ""}</small></p>}
          <p className="ad-detail">{x.why}</p>
          {x.patch && <button type="button" className="btn btn--line btn--sm" onClick={() => set(x.patch)}>Use this</button>}
        </article>)}</div>
      </section>

      {product.panels && <section className="pd-sec" aria-labelledby="h-cost">
        <header><p className="t-label">02 · Cost</p><h2 id="h-cost" className="t-h2">From installed price to net cost.</h2></header>
        <Waterfall result={r} />
        <div className="pd-cols">
          <div className="pd-sources"><p className="t-label">Price basis · {r.price.confidence}</p><p>{r.price.basis}</p><p>Checked {r.price.verified}.</p></div>
          <ul className="bk">{costLines(s, r.price).map((l) => <li key={l.label}><span><b>{l.label}</b><small>{l.detail}</small></span><span className="t-num">{l.amount != null ? inr(l.amount) : l.note}</span></li>)}
            <li className="tot"><span>Total before incentives (priced items only)</span><span className="t-num">{inr(r.gross)}</span></li></ul>
        </div>
      </section>}

      {product.panels && <section className="pd-sec" aria-labelledby="h-year">
        <header><p className="t-label">03 · Through the year</p><h2 id="h-year" className="t-h2">Sun, use and your bill.</h2><p className="t-body">Output in {city.name} changes month by month with cloud, monsoon and heat. {e?.net ? "Surplus units carry forward within the financial year." : "Where export settlement is unverified, only daytime use lowers the bill unless you enter a rate."}</p></header>
        <MonthBars label={`Monthly solar generation in ${city.name}`} unit="kWh" series={[{ cls: "pv", label: "Solar output", values: r.generation.months }, ...(r.load != null ? [{ cls: "use", label: "Your use", values: Array(12).fill(r.load) }] : [])]} />
        {e ? <><MonthBars label="Monthly electricity bill before and after solar, year one" unit="₹" format={inr} series={[{ cls: "use", label: "Bill without solar", values: e.months.map((m) => m.before) }, { cls: "after", label: "Bill with solar", values: e.months.map((m) => m.after) }]} /><Payback result={r} /></>
          : <p className="pd-warnline">Bill and payback charts need your use and a tariff: {r.gaps.join(". ")}.</p>}
      </section>}

      {product.panels && <section className="pd-sec" aria-labelledby="h-sens">
        <header><p className="t-label">04 · Sensitivity</p><h2 id="h-sens" className="t-h2">Move the assumptions.</h2><p className="t-body">Estimates are only as good as their inputs. These sliders change the same calculation used everywhere on this page and in the download.</p></header>
        <div className="in-sens">
          <div className="in-sliders">
            {sliders.map(([key, label, min, max, step, base, show]) => <label key={key} className="in-range"><span>{label}<b className="t-num">{show(Number(st[key] ?? base))}</b></span><input type="range" className="range" min={min} max={max} step={step} value={st[key] ?? base} onChange={(ev) => set({ [key]: Number(ev.target.value) })} /></label>)}
            <label className="in-field"><span>Roof direction</span><select value={s.orientation} onChange={(ev) => set({ orientation: ev.target.value })}><option value="south">South</option><option value="south-east">South-east</option><option value="south-west">South-west</option><option value="east-west">East–west split</option><option value="flat">Flat</option></select></label>
            <button type="button" className="btn btn--line btn--sm" onClick={() => set({ tariffPct: 100, consumptionPct: 100, solarPct: 100, pricePerKw: null, soilingPct: 4, shadingPct: 5, maintenanceInr: 0, inverterInr: 0, orientation: "south" })}>Reset assumptions</button>
          </div>
          <dl className="in-readout" aria-live="polite">
            <div><dt className="t-label">Net cost</dt><dd className="t-num">{inr(r.netCost)}</dd></div>
            <div><dt className="t-label">Year-one output</dt><dd className="t-num">{units(r.generation.annual)} kWh</dd></div>
            <div><dt className="t-label">Year-one saving</dt><dd className="t-num">{e ? inr(e.firstYear) : "—"}</dd></div>
            <div><dt className="t-label">Payback</dt><dd className="t-num">{yrs(e?.payback)}</dd></div>
            <div><dt className="t-label">{LIFE_YEARS}-year net</dt><dd className={`t-num ${e?.lifetimeNet < 0 ? "c-warn" : ""}`}>{e ? inr(e.lifetimeNet) : "—"}</dd></div>
            {(!Number(s.maintenanceInr) || !Number(s.inverterInr)) && <p className="pd-warnline">{[!Number(s.maintenanceInr) && "Maintenance", !Number(s.inverterInr) && "Inverter replacement"].filter(Boolean).join(" and ")} {!Number(s.maintenanceInr) && !Number(s.inverterInr) ? "are" : "is"} set to ₹0. Inverters are typically replaced after 10–12 years; add your own estimate.</p>}
          </dl>
        </div>
      </section>}

      {product.panels && <section className="pd-sec" aria-labelledby="h-cmp">
        <header><p className="t-label">05 · Compare</p><h2 id="h-cmp" className="t-h2">Sizes side by side.</h2><p className="t-body">Same property, tariff and assumptions. Select a size to load it.</p></header>
        <div className="in-table-wrap"><table className="in-table"><thead><tr><th>Size</th><th>Installed cost</th><th>Net cost</th><th>Output a year</th><th>Year-one saving</th><th>Payback</th><th>Roof</th></tr></thead>
          <tbody>{ladder.map((x) => <tr key={x.input.kw} className={x.input.kw === s.kw ? "cur" : ""}>
            <th scope="row"><button type="button" onClick={() => set({ kw: x.input.kw })}>{x.input.kw} kW</button><i style={{ width: `${(x.gross / ladder.at(-1).gross) * 100}%` }} aria-hidden="true" /></th>
            <td className="t-num">{inr(x.gross)}</td><td className="t-num">{inr(x.netCost)}</td><td className="t-num">{units(x.generation.annual)} kWh</td><td className="t-num">{x.economics ? inr(x.economics.firstYear) : "—"}</td><td className="t-num">{yrs(x.economics?.payback)}</td>
            <td className="t-num">{x.roofNeeded} m²{x.roofOk === false ? <em className="c-warn"> too big</em> : null}</td></tr>)}</tbody></table></div>
      </section>}

      <section className="pd-sec" aria-labelledby="h-box">
        <header><p className="t-label">06 · What you get</p><h2 id="h-box" className="t-h2">Hardware, software and what is still planned.</h2></header>
        <div className="addons">{Object.values(PRODUCTS).filter((p) => p.segments.includes(s.segment)).map((p) => <article key={p.id} className={`addon ${p.id === product.id ? "on" : ""}`}><div className="ad-top"><h3>{p.name}</h3></div><p className="ad-detail">{p.line}</p><ul className="in-list">{p.hardware.map((h) => <li key={h}>{h}</li>)}</ul></article>)}</div>
        <div className="pd-cols">
          <div><h3 className="t-label">welOS intelligence status</h3><ul className="bk">{CAPABILITIES.map(([n, status]) => <li key={n}><span>{n}</span><span className="comp-tag">{status}</span></li>)}</ul></div>
          <div className="pd-sources"><p className="t-label">Future modules · not priced, not included</p><p>{FUTURE_MODULES.join(" · ")}.</p><p>No battery is offered in India mode, so there is no backup time or stored-energy claim here. Water and automated cleaning are not part of any price or subsidy.</p></div>
        </div>
      </section>

      <section className="pd-sec" aria-labelledby="h-src">
        <header><p className="t-label">07 · Evidence</p><h2 id="h-src" className="t-h2">Where the numbers come from.</h2><p className="t-body">Data version {DATA_VERSION}, checked {VERIFIED}. Apply for the central subsidy only on the <a href={SOURCES.portal.url} target="_blank" rel="noreferrer">official PM Surya Ghar portal</a>. Rules, rates and prices change.</p></header>
        <div className="pd-sources">{doc.assumptions.map((a) => <p key={a}>{a}</p>)}</div>
        <ul className="bk">{doc.sources.map((x) => <li key={x.url}><span><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a><small>{x.used}</small></span></li>)}</ul>
      </section>
      </>}
    </div>
  );
}

createRoot(document.getElementById("india-root")).render(<India />);
