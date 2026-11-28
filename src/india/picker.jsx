import React, { useEffect, useMemo, useRef, useState } from "react";
import { CITIES, UTILITIES, SOURCES, PRICES, VERIFIED } from "./data.js";
import { priceEstimate, normalise } from "./engine.js";
import { detectPlace } from "./location.js";
import { REGIONS } from "../site/regions.js";

export function cityFacts(city) {
  const tariffs = city.utilities.map((id) => UTILITIES[id]).filter((u) => u.tariff);
  const price = priceEstimate(normalise({ city: city.id, utility: city.utilities.length === 1 ? city.utilities[0] : null }));
  const local = city.utilities.some((id) => UTILITIES[id].delhi);
  return {
    utilities: city.utilities.map((id) => UTILITIES[id].name),
    tariff: tariffs.length ? `${SOURCES[tariffs[0].tariff.source].title.split(",")[0]}${tariffs.length < city.utilities.length ? " (some utilities)" : ""}` : "Not verified: enter your rate",
    hasTariff: tariffs.length > 0,
    pricing: local ? "Published indication for Delhi utilities" : price.confidence,
    solar: "NASA POWER 2001–2025",
  };
}

const WHY = "Used once to find your city. Your browser asks first. The position, rounded to about 1 km, goes to our server and to OpenStreetMap, and is not stored.";

/** "Use my location": nothing happens until the button is pressed, and nothing applies until confirmed. */
export function Locate({ onConfirm, onManual }) {
  const [state, setState] = useState({ phase: "idle" });
  const [utility, setUtility] = useState("");
  const live = useRef(true);
  useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);
  async function run() {
    setState({ phase: "loading" }); setUtility("");
    try { const found = await detectPlace(); if (live.current) { setState({ phase: "found", found }); setUtility(found.utility || ""); } }
    catch (e) { if (live.current) setState({ phase: "error", message: e.message }); }
  }
  const f = state.found;
  const city = f && CITIES.find((c) => c.id === f.city);
  const emirate = f?.status === "uae" && REGIONS.find((r) => r.id === f.region);
  const reset = () => setState({ phase: "idle" });
  return <div className="loc">
    <button type="button" className="btn btn--line btn--sm loc-go" onClick={run} disabled={state.phase === "loading"}>
      <span className={`loc-dot ${state.phase === "loading" ? "busy" : ""}`} aria-hidden="true" />{state.phase === "loading" ? "Finding your location…" : "Use my location"}
    </button>
    {state.phase === "idle" && <p className="t-fine">{WHY}</p>}
    <div aria-live="polite">
      {state.phase === "error" && <p className="pd-warnline">{state.message}</p>}
      {state.phase === "found" && <div className="loc-confirm">
        <p className="t-label">Found: {f.label}</p>
        {city && <>
          <p>{f.status === "nearby" ? <>This place is not covered. The nearest covered city in the same state is <b>{city.name}</b>, about {f.distanceKm} km away. Use it only if your property is served there; tariffs and subsidies can differ.</> : <>Set up this property in <b>{city.name}, {city.state}</b> (India, ₹).</>}</p>
          {!f.utility && <label className="in-field"><span>Your electricity utility</span><select value={utility} onChange={(e) => setUtility(e.target.value)}><option value="">Confirm later</option>{city.utilities.map((id) => <option key={id} value={id}>{UTILITIES[id].name}</option>)}</select></label>}
        </>}
        {emirate && <p>Your location is in <b>{emirate.name}, UAE</b>. Confirming opens the UAE configurator with AED prices and UAE tariffs. Your India build stays saved.</p>}
        {f.status === "unsupported-city" && <p>This place is not covered yet. We will not borrow another city's tariff or subsidy. Choose the city that serves your property.</p>}
        {f.status === "unsupported-country" && <p>welOS configures properties in India and the UAE only. Choose a city manually to explore another property.</p>}
        <div className="loc-actions">
          {city && <button type="button" className="btn btn--sm" onClick={() => { onConfirm(city.id, utility || f.utility || null); reset(); }}>Confirm location</button>}
          {emirate && <a className="btn btn--sm" href={`/product.html?region=${emirate.id}`}>Confirm location</a>}
          <button type="button" className="btn btn--line btn--sm" onClick={() => { reset(); onManual?.(); }}>Change city</button>
        </div>
        <p className="t-fine">Place data © OpenStreetMap contributors.</p>
      </div>}
    </div>
  </div>;
}

/** Searchable manual selector: country → state → city → utility. Works without any location access. */
export function CityPicker({ open, current, onClose, onPick }) {
  const ref = useRef(null);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("in");
  const [region, setRegion] = useState("");
  const [utils, setUtils] = useState({});
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { setQ(""); d.showModal(); } else if (!open && d.open) d.close();
  }, [open]);
  const states = useMemo(() => [...new Set(CITIES.map((c) => c.state))].sort(), []);
  const needle = q.trim().toLowerCase();
  const list = CITIES.filter((c) => (!region || c.state === region) && (!needle || [c.name, c.state, ...c.aliases, ...c.utilities.map((id) => UTILITIES[id].name)].join(" ").toLowerCase().includes(needle)));
  const emirates = REGIONS.filter((r) => !needle || r.name.toLowerCase().includes(needle));
  return <dialog ref={ref} className="in-dialog" onClose={onClose} aria-label="Choose where the property is" onClick={(e) => { if (e.target === ref.current) onClose(); }}>
    <div className="in-dialog-body">
      <header><h2 className="t-h3">Where is the property?</h2><button type="button" className="btn btn--line btn--sm" onClick={onClose}>Close</button></header>
      <div className="in-filters">
        <div className="seg" aria-label="Country">{[["in", "India"], ["ae", "UAE"]].map(([id, l]) => <button key={id} type="button" aria-pressed={country === id} onClick={() => { setCountry(id); setRegion(""); }}>{l}</button>)}</div>
        <input type="search" placeholder={country === "in" ? "Search city, state or utility" : "Search emirate or city"} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        {country === "in" && <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="State"><option value="">All states</option>{states.map((s) => <option key={s}>{s}</option>)}</select>}
      </div>
      <ul className="in-cities">
        {country === "ae" ? emirates.map((r) => <li key={r.id}><a className="in-city" href={`/product.html?region=${r.id}`}><b>{r.name}</b><small>Opens the UAE configurator · AED</small></a></li>)
          : list.map((c) => {
            const x = cityFacts(c), chosen = utils[c.id] ?? "";
            return <li key={c.id} className={`in-city ${current === c.id ? "cur" : ""}`}>
              <div className="in-city-top"><div><b>{c.name}</b><small>{c.state}</small></div><button type="button" className="btn btn--sm" onClick={() => onPick(c.id, chosen || null)}>{current === c.id ? "Keep" : "Select"}<span className="sr-only"> {c.name}</span></button></div>
              <dl>
                <div><dt>Utility</dt><dd>{c.utilities.length > 1 ? <select value={chosen} onChange={(e) => setUtils((u) => ({ ...u, [c.id]: e.target.value }))} aria-label={`Utility in ${c.name}`}><option value="">Confirm yours ({c.utilities.length} options)</option>{c.utilities.map((id) => <option key={id} value={id}>{UTILITIES[id].name}</option>)}</select> : x.utilities[0]}</dd></div>
                <div><dt>Tariff source</dt><dd className={x.hasTariff ? "ok" : "warn"}>{x.tariff}</dd></div>
                <div><dt>Solar data</dt><dd className="ok">{x.solar}</dd></div>
                <div><dt>Pricing</dt><dd className="warn">{x.pricing}</dd></div>
                <div><dt>Verified</dt><dd>{VERIFIED} · price data {PRICES.national.dated}</dd></div>
              </dl>
            </li>;
          })}
        {country === "in" && !list.length && <li className="t-fine">No covered city matches. Cities outside this list are not configured yet.</li>}
      </ul>
    </div>
  </dialog>;
}
