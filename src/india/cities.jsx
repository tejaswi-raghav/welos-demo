import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./shell.js";
import "../product/product.css";
import "./india.css";
import { CITIES, UTILITIES, PRODUCTS, VERIFIED, DATA_VERSION, SOURCES } from "./data.js";
import { evaluate, statuses, inr, units, CAPACITIES, isStale, LIFE_YEARS } from "./engine.js";
import { loadIndia } from "./store.js";

const yrs = (x) => (x ? `${x.toFixed(1)} yrs` : "—");
const MAX = 4;

function Cities() {
  const saved = useMemo(() => loadIndia(), []);
  const [picked, setPicked] = useState(() => [...new Set([saved?.city, "hyderabad", "delhi-ncr", "bengaluru"].filter(Boolean))].slice(0, 3));
  const [kw, setKw] = useState(3);
  const [load, setLoad] = useState(saved?.monthlyKwh ?? 350);
  const [per, setPer] = useState(() => (saved ? { [saved.city]: { utility: saved.utility || "", flatRate: saved.flatRate ?? "" } } : {}));
  const [pkg, setPkg] = useState("solar");
  const [xkw, setXkw] = useState(3);
  useEffect(() => { const chip = document.getElementById("loc-chip"); if (chip) { chip.querySelector("span").textContent = "All cities"; chip.onclick = () => document.getElementById("pick").scrollIntoView({ block: "center" }); } }, []);
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX ? [...p, id] : p));
  const update = (id, patch) => setPer((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const results = picked.map((id) => evaluate({ city: id, utility: per[id]?.utility || null, flatRate: per[id]?.flatRate || null, kw, monthlyKwh: load, product: "solar" }));
  const rows = [
    ["Installed cost", (r) => <><b className="t-num">{inr(r.gross)}</b><small>{inr(r.price.low)} – {inr(r.price.high)}</small></>],
    ["Pricing confidence", (r) => r.price.confidence],
    ["Tariff", (r) => (r.tariff ? <>{r.tariff.label}<small>{r.tariff.excludes || "Flat rate you entered"}</small></> : <span className="c-warn">{r.utility ? "Not verified. Enter your rate above." : "Select a utility above."}</span>)],
    ["Solar resource", (r) => <><b className="t-num">{r.city.sun.annual.toFixed(2)}</b><small>kWh/m²/day, horizontal, NASA POWER 2001–2025</small></>],
    ["Modelled output", (r) => <><b className="t-num">{units(r.generation.annual)} kWh/yr</b><small>Band {units(r.generation.low)} – {units(r.generation.high)}</small></>],
    ["Incentive framework", (r) => <>{r.utility?.delhi ? "Central and Delhi state subsidy; optional generation incentive" : "Central scheme. State additions not verified"}<small>{inr(r.incentives.potential)} possible if eligible</small></>],
    ["Cost today", (r) => <><b className="t-num">{inr(r.netCost)}</b><small>Nothing deducted without an eligibility check</small></>],
    ["If found eligible", (r) => <b className="t-num">{inr(r.gross - r.incentives.potential)}</b>],
    ["Year-one saving", (r) => (r.economics ? <b className="t-num">{inr(r.economics.firstYear)}</b> : "Not calculated")],
    ["Payback on cost today", (r) => <b className="t-num">{yrs(r.economics?.payback)}</b>],
    [`${LIFE_YEARS}-year net`, (r) => <b className="t-num">{r.economics ? inr(r.economics.lifetimeNet) : "—"}</b>],
    ["Export settlement", (r) => (r.utility?.net ? "Monthly net metering, published" : "Unverified: valued at ₹0")],
    ["Data checked", () => VERIFIED],
  ];
  const explorer = CITIES.map((c) => evaluate({ city: c.id, kw: xkw, product: pkg }));

  return (
    <div className="product india in-compare">
      <section className="pd-sec in-top" aria-labelledby="h-cc">
        <header><p className="t-label">welOS India · battery-free</p><h1 id="h-cc" className="t-h1">Compare cities<span className="t-soft"> on equal terms.</span></h1><p className="t-body">Up to four cities, one system size and the same monthly use. Cities appear in the order you add them. We do not rank them: tariffs and data quality differ too much for a single winner.</p></header>
        <div className="in-chips" id="pick" role="group" aria-label="Cities to compare">{CITIES.map((c) => <button key={c.id} type="button" className="chip" aria-pressed={picked.includes(c.id)} disabled={!picked.includes(c.id) && picked.length >= MAX} onClick={() => toggle(c.id)}>{c.name}</button>)}</div>
        <div className="in-controls">
          <div><span className="t-label">System size</span><div className="seg" role="group" aria-label="System size">{CAPACITIES.map((k) => <button key={k} type="button" aria-pressed={kw === k} onClick={() => setKw(k)}>{k} kW</button>)}</div></div>
          <label className="in-num"><span>Monthly use<small>Applied to every city</small></span><span className="st-in"><input type="number" min="0" value={load} onChange={(e) => setLoad(e.target.value === "" ? "" : Number(e.target.value))} /><em>kWh</em></span></label>
        </div>
        {!picked.length ? <p className="pd-warnline">Choose at least one city.</p> : <div className="in-table-wrap"><table className="in-table in-matrix" style={{ minWidth: 160 + picked.length * 190 }}><thead><tr><th><span className="sr-only">Measure</span></th>{results.map((r) => <th key={r.city.id} scope="col"><b>{r.city.name}</b><small>{r.city.state}</small>
          {r.city.utilities.length > 1 ? <select value={per[r.city.id]?.utility || ""} onChange={(e) => update(r.city.id, { utility: e.target.value, flatRate: "" })} aria-label={`Utility in ${r.city.name}`}><option value="">Select utility</option>{r.city.utilities.map((id) => <option key={id} value={id}>{UTILITIES[id].name}</option>)}</select> : <small>{r.utility.name}</small>}
          {!r.utility?.tariff && <input type="number" min="0" step="0.1" placeholder="Your ₹/kWh" value={per[r.city.id]?.flatRate ?? ""} onChange={(e) => update(r.city.id, { flatRate: e.target.value })} aria-label={`Average rate in ${r.city.name}, rupees per unit`} />}
          <a href={`/india.html?city=${r.city.id}`}>Configure →</a></th>)}</tr></thead>
          <tbody>{rows.map(([label, cell]) => <tr key={label}><th scope="row">{label}</th>{results.map((r) => <td key={r.city.id}>{cell(r)}</td>)}</tr>)}</tbody></table></div>}
        <p className="t-fine">Estimates for a south-facing home roof with 5% shading and 4% soiling. Where export settlement is unverified, 40% of use is assumed in daylight and exports are worth ₹0.</p>
      </section>

      <section className="pd-sec" aria-labelledby="h-ex">
        <header><p className="t-label">Price explorer</p><h2 id="h-ex" className="t-h2">Battery-free packages, city by city.</h2><p className="t-body">A quick look without configuring a property. Where the same indicative range appears in several cities, no verified local price is on file; it does not mean prices are equal.</p></header>
        <div className="in-controls">
          <div><span className="t-label">Package</span><div className="seg" role="group" aria-label="Package">{["solar", "intelligence", "core"].map((id) => <button key={id} type="button" aria-pressed={pkg === id} onClick={() => setPkg(id)}>{PRODUCTS[id].name.replace("welOS ", "")}</button>)}</div></div>
          {PRODUCTS[pkg].panels && <div><span className="t-label">Size</span><div className="seg" role="group" aria-label="Package size">{CAPACITIES.map((k) => <button key={k} type="button" aria-pressed={xkw === k} onClick={() => setXkw(k)}>{k} kW</button>)}</div></div>}
        </div>
        <div className="addons">{explorer.map((r) => <article key={r.city.id} className="addon">
          <div className="ad-top"><h3>{r.city.name}</h3><span className="comp-tag">{r.city.state}</span></div>
          {r.price.priced ? <p className={`in-big t-num ${r.utility?.delhi ? "" : "range"}`}>{r.utility?.delhi ? inr(r.gross) : `${inr(r.price.low)} – ${inr(r.price.high)}`}<small>{r.price.confidence}{pkg === "intelligence" ? " · welOS layer extra, not yet priced" : ""}{r.city.id === "delhi-ncr" && !r.utility ? " · a published indication applies once a Delhi utility is selected" : ""}</small></p> : <p className="in-big">Pricing pending<small>Monitoring hardware and fees are not yet priced</small></p>}
          <ul className="in-flags">{statuses(r).map((x) => <li key={x}>{x}</li>)}</ul>
          <a className="btn btn--line btn--sm" href={`/india.html?city=${r.city.id}`}>Configure<span className="sr-only"> {r.city.name}</span></a>
        </article>)}</div>
        <div className="pd-sources"><p className="t-label">Sources · data {DATA_VERSION}, checked {VERIFIED}</p>{Object.values(SOURCES).map((x) => <p key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></p>)}{isStale() && <p className="c-warn">This data is more than six months old.</p>}</div>
      </section>
    </div>
  );
}
createRoot(document.getElementById("india-root")).render(<Cities />);
