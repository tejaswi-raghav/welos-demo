import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import '../ui/base.css';
import './portal.css';
import { ROUTES, routeName } from './routes.js';
import { dispatch } from '../gen1/dispatch.js';
import { sizeGen1 } from '../gen1/config.js';
import { adaptTelemetry } from '../gen1/telemetry.js';
import { financialModel, valuationTargets } from './finance.js';
import sources from '../../business/data/sources.json';
import incentives from '../../business/data/incentives.json';
import markets from '../../business/data/markets.json';
import budget from '../../business/data/prototype.json';
import initial from '../../business/data/finance-assumptions.json';
const number = (v, d = 0) => Number(v).toLocaleString('en-US', {
  maximumFractionDigits: d
});
const money = v => `$${number(v)}`;
const src = Object.fromEntries(sources.map(s => [s.id, s]));
function download(name, value, type = 'application/json') {
  const blob = new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {
    type
  });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function Sources({
  ids
}) {
  return <div className="cp-sources">{ids.map(id => <a key={id} href={src[id]?.url} target="_blank" rel="noreferrer">{src[id]?.title || id} ↗</a>)}</div>;
}
function Metric({
  value,
  label,
  sub
}) {
  return <div className="cp-metric"><strong>{value}</strong><span>{label}</span>{sub && <small>{sub}</small>}</div>;
}
function Section({
  eyebrow,
  title,
  children
}) {
  return <section className="cp-section"><span className="cp-eyebrow">{eyebrow}</span><h2>{title}</h2>{children}</section>;
}
function Card({
  title,
  children
}) {
  return <article className="cp-card"><h3>{title}</h3>{children}</article>;
}
function Doc({
  path,
  children
}) {
  return <a className="cp-doc" href={`/resources/${path}`} download>{children} <span>↓</span></a>;
}
function Numeric({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max
}) {
  return <label className="cp-field">{label}<input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} /></label>;
}
const productVariants = [['Core Gen 1', 'Validation plan', 'Solar monitoring, diagnostics and site-specific certified EPC integration. Battery-free.'], ['Solar', 'Proposed package', 'Standard PV and monitored commissioning through qualified EPCs.'], ['Hybrid', 'Future evaluation', 'Existing battery and wind demos remain available. New physical variants need their own certification and economics.'], ['Water', 'Future evaluation', 'Non-potable sensing and cleaning only after measured safety and water economics.'], ['Intelligence', 'Software hypothesis', 'Performance alerts, maintenance records and service workflows. Paid retention still unproven.'], ['Enterprise', 'Future evaluation', 'Multi-site reporting and integrations after repeatable single-site operations.']];
function Overview() {
  return <><div className="cp-statement"><p className="cp-eyebrow">Commercial foundation · 01</p><h1>A roof that earns.<br /><em>A system you can verify.</em></h1><p>welOS brings solar performance, water awareness and maintenance intelligence into one operating layer. Gen 1 starts with solar monitoring and a battery-free validation platform.</p><div className="cp-actions"><a className="cp-primary" href="/prototype">Explore Gen 1</a><a href="/investors">Open the financial model ↗</a></div></div><div className="cp-metrics"><Metric value="AED 10,000" label="Prototype spending cap" sub="Includes contingency" /><Metric value="0 kWh" label="Gen 1 battery storage" sub="No outage backup" /><Metric value="1 city" label="Initial beachhead" sub="Hyderabad, subject to pilot access" /></div><Section eyebrow="Product strategy" title="Prove the useful part. Expand with evidence."><div className="cp-grid">{productVariants.map(([n, s, t]) => <Card key={n} title={n}><span className="cp-tag">{s}</span><p>{t}</p></Card>)}</div></Section><Section eyebrow="Commercial model" title="Hardware opens the door. Service has to earn its renewal."><div className="cp-grid"><Card title="Standardized retrofit"><p>A proposed monitoring kit plus installation coordination. Full PV, canopy and inverter installations remain separate EPC quotes.</p></Card><Card title="Service and software"><p>Optional monitoring subscriptions and maintenance contracts. Every recurring-revenue projection is a hypothesis until customers pay and renew.</p></Card><Card title="Distribution"><p>Train one qualified EPC, demonstrate measured performance, publish transparent scope and make the handover repeatable.</p><a href="/partners">Partner qualification ↗</a></Card></div></Section><Section eyebrow="Evidence today" title="Working software. Physical validation ahead."><p>The existing showroom, 3D Explorer and Control OS are demonstrations. The lab rig has not been assembled or physically tested. The founders report AED 10,000 support from BITS Pilani; receipt and conditions require confirmation. No customer revenue, contracted pilots or confirmed distribution partners are asserted.</p><Doc path="business/investors/EXECUTIVE_SUMMARY.md">Executive summary</Doc></Section></>;
}
function Prototype() {
  const [pv, setPv] = useState(2400),
    [load, setLoad] = useState(1800),
    [grid, setGrid] = useState(true),
    [exportOk, setExport] = useState(false),
    [maintenance, setMaintenance] = useState(false);
  const [utility, setUtility] = useState('dewa'),
    [roof, setRoof] = useState(60),
    [daily, setDaily] = useState(45),
    [clean, setClean] = useState(false);
  const [raw, setRaw] = useState(''),
    [identity, setIdentity] = useState(''),
    [snapshot, setSnapshot] = useState(null),
    [error, setError] = useState(''),
    [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const balance = dispatch({
    pvDcW: pv,
    buildingW: load,
    gridAvailable: grid,
    exportApproved: exportOk && utility === 'dewa',
    maintenanceW: maintenance ? 15 : 0
  });
  const sized = useMemo(() => sizeGen1({
    utilityId: utility,
    exportApproved: exportOk,
    inputs: {
      roofM2: roof,
      loadKwhDay: daily
    },
    cleaning: clean
  }), [utility, exportOk, roof, daily, clean]);
  function ingest() {
    try {
      if (raw.length > 65536) throw Error('Snapshot exceeds 64 KB');
      if (!identity.trim()) throw Error('Enter the expected device ID first');
      const next = adaptTelemetry(JSON.parse(raw), {
        expectedDeviceId: identity.trim(),
        previousTimestamp: snapshot?.timestamp
      });
      setSnapshot(next);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }
  return <><p className="cp-eyebrow">Engineering demonstrator · 02</p><h1>Solar first.<br /><em>Evidence before scale.</em></h1><p className="cp-lede">A low-voltage lab rig validates measurement, interlocks and telemetry. A certified grid installation requires a separate design, approved inverter and utility connection.</p><div className="cp-metrics"><Metric value={`AED ${number(budget.totalAed)}`} label="Planned all-in lab budget" sub="Public prices and quote-required ceilings" /><Metric value={`AED ${number(budget.contingencyAed)}`} label="20% contingency" /><Metric value="Not built" label="Physical validation status" /></div><Section eyebrow="Battery-free planning" title="Same sizing engine. A separate Gen 1 configuration."><div className="cp-two"><div className="cp-card cp-form"><label>Utility<select value={utility} onChange={e => {
              setUtility(e.target.value);
              setExport(false);
            }}><option value="dewa">Dubai · DEWA</option><option value="sewa">Sharjah · SEWA</option><option value="taqa">Abu Dhabi · regulatory hold</option></select></label><Numeric label="Usable roof (m²)" value={roof} min={1} max={1000} onChange={v => setRoof(Math.max(1, Number(v) || 1))} /><Numeric label="Building electricity (kWh/day)" value={daily} min={1} max={10000} onChange={v => setDaily(Math.max(1, Number(v) || 1))} /><label className="cp-check"><input type="checkbox" checked={clean} onChange={e => setClean(e.target.checked)} /> Include optional intelligent cleaning in estimate</label><label className="cp-check"><input type="checkbox" disabled={utility !== 'dewa'} checked={exportOk} onChange={e => setExport(e.target.checked)} /> Site-specific DEWA export approval confirmed</label><button onClick={() => download('welos-core-gen1-build.json', {
            configuration: 'core-gen1',
            version: 1,
            inputs: {
              roofM2: roof,
              loadKwhDay: daily
            },
            utilityId: utility,
            exportApproved: exportOk,
            choices: {
              battery: false,
              wind: false,
              cleaning: clean
            },
            storageKwh: 0
          })}>Download Gen 1 build</button></div><div><div className="cp-metrics cp-compact"><Metric value={`AED ${number(sized.totals.totalAed)}`} label="Full solar-system estimate" /><Metric value={`AED ${number(sized.totals.annualSavingsAed)}`} label="Modeled first-year bill reduction" /><Metric value="0" label="Battery cost / backup hours" /></div><p>Existing UAE estimator, including canopy, inverter and controller. This is separate from both the lab BOM and the retrofit-kit company model. Excludes O&M, replacement, tariff changes and financing costs. Confirm site quotes and approvals.</p><p>{sized.economicsBasis}</p>{utility === 'taqa' && <p className="cp-notice">Abu Dhabi: indicative load/tariff planning only. Current licensing guidance identifies a suspension. This page gives export credits zero value.</p>}<Sources ids={utility === 'taqa' ? ['abu', 'abu-old'] : ['dewa', 'connection']} /></div></div></Section><Section eyebrow="Synthetic simulation" title="Generation follows the sun. Continuity follows the grid."><div className="cp-two"><div className="cp-card"><label>PV DC power: {number(pv)} W<input type="range" min="0" max="6000" step="100" value={pv} onChange={e => setPv(+e.target.value)} /></label><label>Building demand: {number(load)} W<input type="range" min="0" max="6000" step="100" value={load} onChange={e => setLoad(+e.target.value)} /></label><label className="cp-check"><input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)} /> Grid available</label><label className="cp-check"><input type="checkbox" checked={maintenance} onChange={e => setMaintenance(e.target.checked)} /> 15 W maintenance pump demand</label><p>Controller draw: 5 W. Inverter efficiency assumption: 96%. These controls simulate the commercial architecture and do not operate hardware.</p></div><div className="cp-balance" aria-live="polite"><span className="cp-tag">SIMULATION · {balance.mode}</span><div className="cp-metrics cp-compact"><Metric value={`${number(balance.pvUsedW)} W`} label="PV serving load" /><Metric value={`${number(balance.gridImportW)} W`} label="Grid import" /><Metric value={`${number(balance.gridExportW)} W`} label="Eligible grid export" /><Metric value={`${number(balance.curtailedW)} W`} label="Unavailable / curtailed solar" /><Metric value={`${number(balance.unmetW)} W`} label="Unserved demand" /></div><p>{grid ? 'Demand includes controller and selected maintenance draw. Unapproved surplus is curtailed in this model.' : 'Anti-islanding shuts the inverter down. All demand is unserved and the grid-powered controller stops. The lab has a separately labeled auxiliary supply.'}</p></div></div></Section><Section eyebrow="Read-only hardware interface" title="Import measurements. Keep their provenance visible."><div className="cp-two"><div className="cp-card"><label>Expected device ID<input value={identity} maxLength={64} onChange={e => setIdentity(e.target.value)} /></label><label>Hardware JSON snapshot<textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder="Paste a real schemaVersion: 1 hardware envelope. No sensor values are prefilled." rows={7} /></label><button onClick={ingest}>Validate snapshot</button><button className="cp-secondary" onClick={() => {
            setSnapshot(null);
            setError('');
            setRaw('');
          }}>Clear snapshot</button>{error && <p role="alert" className="cp-notice">{error}</p>}<Doc path="hardware/gen1/TELEMETRY_CONTRACT.md">Telemetry contract and missing-data template</Doc></div><div className="cp-card" aria-live="polite">{snapshot ? <><span className="cp-tag">IMPORTED HARDWARE SNAPSHOT · {clock - Date.parse(snapshot.timestamp) > 5000 ? 'STALE' : snapshot.connectivity.toUpperCase()}</span><h3>{snapshot.deviceId}</h3><p>{snapshot.timestamp}<br />Read-only. Identity and calibration unverified. No claim of a continuous live connection.</p><dl>{Object.entries(snapshot.sensors).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v === null ? 'Unavailable' : number(v, 2)}</dd></React.Fragment>)}<dt>Controller mode</dt><dd>{snapshot.controllerMode}</dd><dt>Pump state</dt><dd>{snapshot.pumpState === null ? 'Unavailable' : snapshot.pumpState ? 'On' : 'Off'}</dd><dt>Faults</dt><dd>{snapshot.faults.length ? snapshot.faults.join(', ') : 'None reported'}</dd></dl></> : <><span className="cp-tag">NO HARDWARE CONNECTED</span><h3>Awaiting a real snapshot</h3><p>No solar, temperature or water readings are generated here. Missing sensors must use null and retain their unavailable status.</p></>}</div></div></Section><Section eyebrow="Procurement plan" title="A measured budget with explicit holds."><p>Subtotal AED {number(budget.subtotalAed)} + contingency AED {number(budget.contingencyAed)} = AED {number(budget.totalAed)}. Headroom AED {number(budget.headroomAed)}. Budget ceilings are estimates, not supplier quotations. Check stock, freight and compatibility before orders.</p><div className="cp-table"><table><thead><tr><th>Part</th><th>Qty</th><th>Budget AED</th><th>Evidence</th></tr></thead><tbody>{budget.items.map(i => <tr key={i.id}><td>{i.part}<small>{i.note}</small></td><td>{i.quantity}</td><td>{number(i.budgetTotalAed)}</td><td>{i.publicUnitPrice !== null && <span>{i.publicCurrency} {i.publicUnitPrice} public unit price<br /></span>}{i.sourceUrl ? <a href={i.sourceUrl} target="_blank" rel="noreferrer">{i.priceBasis} ↗</a> : i.priceBasis}<small>Checked {i.verifiedDate}. {i.availability}</small></td></tr>)}</tbody></table></div><Doc path="hardware/gen1/BOM.csv">Download detailed BOM</Doc><Doc path="hardware/gen1/TEST_PLAN.md">Physical test plan</Doc><Doc path="hardware/gen1/REGULATORY_GAPS.md">Engineering and certification gaps</Doc></Section></>;
}
function Markets() {
  const [c, setC] = useState('All');
  return <><p className="cp-eyebrow">Expansion research · 03</p><h1>Start local.<br /><em>Earn the next city.</em></h1><p className="cp-lede">Initial beachhead: Hyderabad monitoring retrofits through one qualified EPC. This is a strategic inference based on a smaller pilot scope and local supplier access, subject to founder access and customer validation.</p><label className="cp-inline">Country<select value={c} onChange={e => setC(e.target.value)}>{['All', 'India', 'UAE'].map(v => <option key={v}>{v}</option>)}</select></label><div className="cp-grid">{markets.filter(m => c === 'All' || m.country === c).map(m => <Card key={m.city} title={m.city}><span className="cp-tag">{m.priority}</span><p>{m.customer}</p><h4>Approval pathway</h4><p>{m.approvalPath}</p><h4>Decision constraint</h4><p>{m.risk}</p><Sources ids={m.sourceIds} /></Card>)}</div><Section eyebrow="Entry gate" title="One installer, three measured pilots, one repeatable handover."><p>Interview 20 customers and 5 EPCs in 30 days. Secure 3 qualified pilot intents by day 90. Expand only after safe installations, measured performance, positive contribution margin and evidence of paid service retention. No simultaneous nine-city launch is assumed.</p><Doc path="business/markets/INDIA.md">India market report</Doc><Doc path="business/markets/UAE.md">UAE market report</Doc><Doc path="business/markets/REGULATORY_CHECKLIST.md">Regulatory checklist</Doc></Section></>;
}
function Incentives() {
  const [c, setC] = useState('All'),
    [type, setType] = useState('All'),
    [query, setQuery] = useState(''),
    [hide, setHide] = useState(false);
  const list = incentives.filter(i => (c === 'All' || i.country === c) && (type === 'All' || i.type === type) && JSON.stringify(i).toLowerCase().includes(query.toLowerCase()) && (!hide || !i.status.toLowerCase().includes('closed')));
  return <><p className="cp-eyebrow">Funding research · 05</p><h1>Find the right support.<br /><em>Verify every condition.</em></h1><p className="cp-lede">Checked 27 November 2026. Grants, equity, debt, incubation and customer subsidies serve different purposes. No award or eligibility is asserted for Welos.</p><div className="cp-filters"><label>Country<select value={c} onChange={e => setC(e.target.value)}>{['All', 'UAE', 'India'].map(v => <option key={v}>{v}</option>)}</select></label><label>Program type<select value={type} onChange={e => setType(e.target.value)}>{['All', ...new Set(incentives.map(i => i.type))].map(v => <option key={v}>{v}</option>)}</select></label><label>Search<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Program, evidence or eligibility" /></label><label className="cp-check"><input type="checkbox" checked={hide} onChange={e => setHide(e.target.checked)} /> Hide closed windows</label></div><p role="status">{list.length} programs match</p><div className="cp-grid">{list.map(i => <Card key={i.id} title={i.name}><span className="cp-tag">{i.type}</span><p><strong>{i.benefit}</strong></p><dl><dt>Eligibility</dt><dd>{i.eligibility}</dd><dt>Incorporation</dt><dd>{i.incorporation}</dd><dt>Status</dt><dd>{i.status}</dd><dt>Deadline</dt><dd>{i.deadline || 'Not confirmed / not published'}</dd><dt>Required evidence</dt><dd>{i.evidence}</dd><dt>Next action</dt><dd>{i.nextAction}</dd></dl><small>Last verified {i.verifiedDate}</small><Sources ids={i.sourceIds} /><button onClick={() => download(`${i.id}-application-preparation.md`, `# ${i.name}: preparation draft\n\nNot submitted. Eligibility not confirmed.\n\nWelos proposes a battery-free solar monitoring and safe low-voltage prototype. Team: Akhil Suravarapu and Tejaswi Raghavendra; roles to confirm. Founder-reported AED10k BITS support requires evidence.\n\nProgram: ${i.type}\nBenefit: ${i.benefit}\nStatus: ${i.status}\nDeadline: ${i.deadline || 'Confirm with provider'}\n\nRequired: ${i.evidence}\nNext action: ${i.nextAction}\n\nMissing facts: [legal entity], [incorporation date], [nationality/residency], [cap table], [IP rights], [prior grants], [roles/experience], [actual revenue], [pilot evidence].\n\nSources: ${i.sourceIds.map(k => src[k].url).join('\n')}\nChecked ${i.verifiedDate}`, 'text/markdown')}>Download preparation draft</button></Card>)}</div>{!list.length && <p>No matching programs. Clear the filters to review the database.</p>}<Doc path="business/funding/INCENTIVES.csv">Download incentive database</Doc><Doc path="business/funding/APPLICATION_DRAFTS.md">Grant application working drafts</Doc></>;
}
function Partners() {
  const [segment, setSegment] = useState('EPC installer'),
    [checks, setChecks] = useState({}),
    [name, setName] = useState('');
  const gates = ['Local license and utility enrollment checked', 'Engineer reviewed installation scope', 'Product warranty and liability boundaries agreed', 'Response times and spare-part process agreed', 'Customer consent and telemetry data terms agreed'];
  return <><p className="cp-eyebrow">Distribution · 04</p><h1>Premium by design.<br /><em>Accessible through trust.</em></h1><p className="cp-lede">Standard scope, transparent prices and trained installation partners. Prospective pathways below do not represent signed partnerships or financing offers.</p><div className="cp-grid">{['Residential owners', 'Property developers', 'EPC installers', 'Commercial owners', 'Universities', 'Government demonstrations'].map(t => <Card key={t} title={t}><p>{{
            'Residential owners': 'Start with a bill and roof survey. Separate equipment price, installation, service and any customer subsidy.',
            'Property developers': 'Define a repeatable specification, roof-access rights and handover to each property manager.',
            'EPC installers': 'Bring the approvals, qualified crew and commissioning record. Welos supplies monitoring and service workflows.',
            'Commercial owners': 'Match daytime loads, billing meter and permission path before modeling savings.',
            'Universities': 'Provide supervised lab access, measurement references and an independent technical review.',
            'Government demonstrations': 'Use the formal procurement route and a written pilot scope with verified eligibility.'
          }[t]}</p></Card>)}</div><Section eyebrow="Partner qualification" title="A reviewable pilot brief before a commitment."><div className="cp-two"><div className="cp-card"><label>Prospective organization<input value={name} onChange={e => setName(e.target.value)} placeholder="For local draft only" maxLength={150} /></label><label>Pathway<select value={segment} onChange={e => setSegment(e.target.value)}>{['EPC installer', 'Developer', 'Residential owner', 'Commercial owner', 'University', 'Government'].map(v => <option key={v}>{v}</option>)}</select></label>{gates.map(g => <label className="cp-check" key={g}><input type="checkbox" checked={!!checks[g]} onChange={e => setChecks({
              ...checks,
              [g]: e.target.checked
            })} />{g}</label>)}<p>{gates.filter(g => checks[g]).length} of {gates.length} prerequisites documented. Qualification requires independent review.</p><button onClick={() => download('welos-partner-brief.json', {
            status: 'Unsubmitted working draft',
            organization: name || '[organization]',
            pathway: segment,
            scope: 'Three monitored retrofit pilots; no mains work without qualified EPC approval',
            prerequisites: gates.map(g => ({
              item: g,
              documented: !!checks[g]
            })),
            remaining: gates.filter(g => !checks[g]),
            acceptance: 'Safe commissioning; 30 days data; >95% expected telemetry coverage; measurement validation; actual customer willingness to pay',
            commercialTerms: 'To negotiate. No financing, subsidy or partner commitment represented.'
          })}>Download pilot brief</button></div><div><h3>Commercial handover</h3><ol><li>Survey load, asset condition and roof rights.</li><li>Define equipment, EPC work and support scope separately.</li><li>Agree acceptance tests and service response.</li><li>Train operator and preserve commissioning records.</li><li>Offer monitoring renewal after demonstrated usefulness.</li></ol><p>Financing can only come from an appropriately authorized lender under its own underwriting and disclosures. Welos makes no credit offer.</p><Sources ids={['epc', 'connection']} /><Doc path="business/investors/PILOT_PROPOSAL.md">Pilot proposal</Doc><Doc path="business/strategy/DISTRIBUTION.md">Distribution and six customer briefs</Doc></div></div></Section></>;
}
function Investors() {
  const [a, setA] = useState(() => structuredClone(initial)),
    [scenario, setScenario] = useState('base'),
    [advanced, setAdvanced] = useState(''),
    [error, setError] = useState('');
  let model,
    targets,
    validationError = error;
  try {
    model = financialModel(a, scenario);
    targets = valuationTargets(a.valuation);
  } catch (e) {
    validationError ||= e.message;
  }
  function editMarket(index, key, value) {
    setA({
      ...a,
      markets: a.markets.map((m, i) => i === index ? {
        ...m,
        [key]: value
      } : m)
    });
  }
  function editYear(key, y, value) {
    setA({
      ...a,
      scenarios: {
        ...a.scenarios,
        [scenario]: {
          ...a.scenarios[scenario],
          [key]: a.scenarios[scenario][key].map((v, i) => i === y ? value : v)
        }
      }
    });
  }
  return <><p className="cp-eyebrow">Company model · 06</p><h1>Every ambition<br /><em>needs a denominator.</em></h1><p className="cp-lede">Editable five-year assumptions for retrofit monitoring kits and paid services. Zero booked revenue is asserted. The full rooftop solar estimator and the lab BOM are separate scopes.</p><div className="cp-actions"><Doc path="business/investors/EXECUTIVE_SUMMARY.md">Executive summary</Doc><Doc path="business/investors/WELOS_INVESTOR_PITCH.pptx">Investor PowerPoint deck</Doc><Doc path="business/investors/PITCH_DECK.md">Investor pitch source</Doc><Doc path="business/investors/RISK_REGISTER.md">Risk register</Doc></div><Section eyebrow="Five-year operating model" title="Change the assumptions. See the cash requirement."><div className="cp-filters"><label>Scenario<select value={scenario} onChange={e => setScenario(e.target.value)}>{Object.keys(a.scenarios).map(v => <option key={v}>{v}</option>)}</select></label><Numeric label="INR per USD (assumption)" value={a.fx.inrPerUsd} step={.1} onChange={v => setA({
          ...a,
          fx: {
            ...a.fx,
            inrPerUsd: v
          }
        })} /><Numeric label="Opening cash USD" value={a.openingCashUsd} onChange={v => setA({
          ...a,
          openingCashUsd: v
        })} /><Numeric label="Subscription attach" value={a.scenarios[scenario].attach} step={.05} max={1} onChange={v => setA({
          ...a,
          scenarios: {
            ...a.scenarios,
            [scenario]: {
              ...a.scenarios[scenario],
              attach: v
            }
          }
        })} /><Numeric label="Annual subscriber churn" value={a.scenarios[scenario].churn} step={.01} max={1} onChange={v => setA({
          ...a,
          scenarios: {
            ...a.scenarios,
            [scenario]: {
              ...a.scenarios[scenario],
              churn: v
            }
          }
        })} /></div><p>Opening cash assumes the founder-reported BITS Pilani support is received and unrestricted. Set to zero until verified. No grant, equity or loan inflows are assumed. Tax rates, working capital and timing conventions are planning inputs.</p><div className="cp-table"><table><caption>Editable annual unit sales and fixed operating costs</caption><thead><tr><th>Driver</th>{[1, 2, 3, 4, 5].map(v => <th key={v}>Year {v}</th>)}</tr></thead><tbody>{['india', 'uae', 'opex'].map(k => <tr key={k}><th>{k === 'opex' ? 'Fixed OPEX USD' : `${k.toUpperCase()} units`}</th>{a.scenarios[scenario][k].map((v, y) => <td key={y}><input aria-label={`${k} year ${y + 1}`} type="number" min="0" value={v} onChange={e => editYear(k, y, e.target.value === '' ? '' : +e.target.value)} /></td>)}</tr>)}</tbody></table></div><details><summary>Unit economics and pricing inputs</summary><div className="cp-two">{a.markets.map((m, i) => <Card key={m.id} title={`${m.id.toUpperCase()} · ${m.currency}`}><p>Retrofit monitoring kit. Excludes PV/canopy/inverter. Prices exclude indirect tax. Assumptions pending three supplier and EPC quotes.</p><div className="cp-two">{Object.keys(m).filter(k => !['id', 'currency', 'perUsd'].includes(k)).map(k => <Numeric key={k} label={k} value={m[k]} step={k.endsWith('Rate') ? .01 : 1} max={k.endsWith('Rate') ? 1 : undefined} onChange={v => editMarket(i, k, v)} />)}</div></Card>)}</div></details>{validationError && <p role="alert" className="cp-notice">{validationError}</p>}{model && <><div className="cp-metrics"><Metric value={money(model.rows[4].revenue)} label="Year 5 revenue" sub={`${scenario} scenario · USD`} /><Metric value={money(model.rows[4].arr)} label="Year 5 exit software ARR" sub="Service fees excluded" /><Metric value={money(model.fundingRequired)} label="Peak incremental cash need" sub="Before financing inflows" /></div><div className="cp-table"><table><caption>USD forecast; all values depend on assumptions</caption><thead><tr><th>Metric</th>{model.rows.map(r => <th key={r.year}>Y{r.year}</th>)}</tr></thead><tbody>{[['Units', 'units'], ['Hardware + installation revenue', 'hardwareRevenue'], ['Monitoring revenue', 'recurringRevenue'], ['Service revenue', 'serviceRevenue'], ['Total revenue', 'revenue'], ['Gross profit', 'grossProfit'], ['Acquisition cost', 'acquisition'], ['Fixed OPEX', 'opex'], ['EBITDA', 'ebitda'], ['Capex', 'capex'], ['Change in working capital', 'deltaWc'], ['Free cash flow', 'freeCashFlow'], ['Cash before financing', 'closingCash']].map(([label, k]) => <tr key={k}><th>{label}</th>{model.rows.map(r => <td key={r.year}>{number(r[k])}</td>)}</tr>)}</tbody></table></div><p>{model.basis}</p></>}<div className="cp-actions"><button onClick={() => download('welos-finance-assumptions.json', a)}>Download editable assumptions</button><button disabled={!model} onClick={() => {
          const keys = Object.keys(model.rows[0]);
          download('welos-forecast.csv', [keys.join(','), ...model.rows.map(r => keys.map(k => r[k]).join(','))].join('\n'), 'text/csv');
        }}>Download current forecast CSV</button><button className="cp-secondary" onClick={() => {
          setA(structuredClone(initial));
          setError('');
        }}>Reset assumptions</button></div><details><summary>Import full JSON assumptions, including cash timing and valuation</summary><p>Only known financial fields are used. Invalid inputs stop the forecast. This stays in your browser and does not modify the repository.</p><textarea rows={10} value={advanced} onChange={e => setAdvanced(e.target.value)} aria-label="Full finance assumptions JSON" /><button onClick={() => {
          try {
            const next = JSON.parse(advanced);
            for (const s of ['conservative', 'base', 'aggressive']) financialModel(next, s);
            valuationTargets(next.valuation);
            setA(next);
            setError('');
          } catch (e) {
            setError(`Import rejected: ${e.message}`);
          }
        }}>Apply JSON assumptions</button></details></Section><Section eyebrow="$100M equity target · sensitivity only" title="What operating scale would the target require?"><p>These are planning multiples, not market quotations. They do not establish a present Welos valuation. Net debt converts an equity target into enterprise value.</p><div className="cp-filters">{['targetEquityUsd', 'netDebtUsd', 'hardwareRevenueMultiple', 'arrMultiple', 'ebitdaMultiple', 'strategicPremium'].map(k => <Numeric key={k} label={k} min={k === 'netDebtUsd' ? -1000000000000 : 0} value={a.valuation[k]} step={k.includes('Multiple') || k === 'strategicPremium' ? .1 : 1000000} onChange={v => setA({
          ...a,
          valuation: {
            ...a.valuation,
            [k]: v
          }
        })} />)}</div>{targets && <div className="cp-grid"><Card title="Hardware-led"><strong>{money(targets.hardwareRevenue)} annual revenue</strong><p>Target EV ÷ hardware revenue multiple.</p></Card><Card title="Software-led"><strong>{money(targets.softwareArr)} software ARR</strong><p>Target EV ÷ ARR multiple. Requires measured retention and software margins.</p></Card><Card title="Hybrid"><strong>{money(targets.hybridHardwareRevenue)} hardware revenue<br />+ {money(targets.hybridArr)} software ARR</strong><p>Half of EV to each distinct stream. Subscription revenue is excluded from hardware revenue.</p></Card><Card title="EBITDA"><strong>{money(targets.ebitda)} EBITDA</strong><p>Target EV ÷ EBITDA multiple.</p></Card><Card title="Strategic acquisition sensitivity"><strong>{money(targets.strategicStandaloneEv)} standalone EV</strong><p>Target EV ÷ (1 + assumed acquisition premium). No acquirer interest is asserted.</p></Card></div>}<Sources ids={['solaredge', 'enphase', 'sensorfact']} /><Doc path="business/finance/MODEL_GUIDE.md">Model formulas, exclusions and sensitivities</Doc><Doc path="business/finance/VALUATION.md">Comparable evidence and valuation limits</Doc></Section></>;
}
function Enterprise() {
  const [sites, setSites] = useState(5),
    [selected, setSelected] = useState({});
  const tasks = ['Site permission and licensed EPC confirmed', 'Metering interfaces and rights to data documented', 'Single-site acceptance and service margin demonstrated', 'Tenant privacy, access control and retention agreed', 'Fleet support, uptime and incident ownership costed'];
  return <><p className="cp-eyebrow">Future product · 07</p><h1>One operating view.<br /><em>Many accountable sites.</em></h1><p className="cp-lede">Enterprise is a proposed extension. Multi-tenant authentication, billing, live fleet integrations and production SLAs are not implemented by this research portal.</p><Section eyebrow="Portfolio scoping tool" title="Build a concrete discovery brief."><div className="cp-two"><div className="cp-card"><Numeric label="Sites to assess" value={sites} min={1} max={1000} onChange={v => setSites(Math.min(1000, Math.max(1, +v || 1)))} />{tasks.map(t => <label className="cp-check" key={t}><input type="checkbox" checked={!!selected[t]} onChange={e => setSelected({
              ...selected,
              [t]: e.target.checked
            })} />{t}</label>)}<button onClick={() => download('welos-enterprise-discovery.json', {
            status: 'Proposed scope, no commercial offer',
            sites,
            completed: tasks.filter(t => selected[t]),
            remaining: tasks.filter(t => !selected[t]),
            requirements: ['Read-only certified inverter/meter interface', 'Tenant-scoped access', 'Documented incident ownership', 'Data retention and deletion contract'],
            pricing: 'Custom discovery required; no fleet quote or SLA asserted'
          })}>Download discovery brief</button></div><div><h3>{sites} sites, one repeatable acceptance process</h3><p>Track permissions, device identities, measured yield, alert-to-resolution times and service cost for each site. Add portfolio comparison only after calibration and timestamp quality are demonstrated.</p><div className="cp-grid"><Card title="Data boundary"><p>Read-only interfaces first. No browser command endpoint to pumps or utility switchgear.</p></Card><Card title="Commercial gate"><p>Positive contribution margin, referenceable pilots and a funded service process before fleet commitments.</p></Card></div><Doc path="business/strategy/PRODUCT_STRATEGY.md">Product feasibility and readiness</Doc><Doc path="business/investors/ROADMAP.md">Execution roadmap and gates</Doc></div></div></Section></>;
}
const content = {
  business: Overview,
  prototype: Prototype,
  markets: Markets,
  partners: Partners,
  incentives: Incentives,
  investors: Investors,
  enterprise: Enterprise
};
export function App({
  path = location.pathname
}) {
  const page = routeName(path);
  const View = content[page];
  useEffect(() => {
    document.title = `welOS · ${ROUTES[page]}`;
  }, []);
  return <div className="cp"><a className="cp-skip" href="#cp-main">Skip to content</a><header className="cp-header"><a href="/business" aria-label="welOS commercial overview"><img src="/brand/welos-wordmark-ivory.svg" alt="welOS" width="120" height="38" /></a><span className="cp-header-label">Commercial portal</span><a className="cp-showroom" href="/">Return to showroom ↗</a></header><div className="cp-shell"><aside className="cp-nav"><span className="cp-eyebrow">Build the business</span><nav aria-label="Commercial portal">{Object.entries(ROUTES).map(([k, label], i) => <a key={k} href={`/${k}`} aria-current={page === k ? 'page' : undefined}><span>0{i + 1}</span>{label}</a>)}</nav><div className="cp-nav-note">Research checked<br />27 November 2026<br /><span>Proposed commercial scope</span></div></aside><main id="cp-main"><View /></main></div><footer className="cp-footer"><img src="/brand/welos-icon.svg" width="28" height="28" alt="" /><p>welOS · Commercial research and prototype planning.<br />Engineering validation, incorporation and site approvals remain open.</p><a href="/resources/business/data/sources.json" download>Source register ↓</a></footer></div>;
}
if (typeof document !== 'undefined') createRoot(document.getElementById('commercial-root')).render(<App />);
