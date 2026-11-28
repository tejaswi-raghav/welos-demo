// India market data. Data only: every formula lives in engine.js.
// Rule for this file: a figure is here only if a source was read for it. A gap stays null
// and the interface asks for the number or says it is missing. Nothing is scaled from UAE data
// and no city multiplier exists.

export const DATA_VERSION = "IN-2026-11-28";
export const VERIFIED = "2026-11-28";
export const STALE_AFTER_DAYS = 180;

export const SOURCES = Object.freeze({
  bsesFaq: { title: "BSES Delhi, PM Surya Ghar rooftop solar FAQ (Sep 2025)", url: "https://www.bsesdelhi.com/documents/55701/1611949183/RTS_FAQ_Sep25.pdf", used: "Central and Delhi subsidy rules, DCR and empanelled-vendor conditions, Delhi indicative cost per kW, net-metering settlement, roof area per kW" },
  derc: { title: "DERC electricity tariff schedule (FY 2020-21; same domestic rates in FY 2021-22)", url: "https://www.derc.gov.in/sites/default/files/Tariff%20Schedule%202020-21.pdf", used: "Delhi domestic energy slabs and fixed charges. Check that no later order has replaced them before relying on a bill." },
  kerc: { title: "BESCOM electricity tariff, KERC Combined Tariff Order 2025 (FY 2026-27 column)", url: "https://bescom.karnataka.gov.in/storage/pdf-files/Customer%20Relations/TariffOrder-2025Annexure-9.pdf", used: "Bengaluru LT-1 domestic energy and fixed charge (read from the search extract of the official file)" },
  mercom: { title: "Mercom Q3 2026 India rooftop solar market data, reported by pv magazine India (26 Nov 2026)", url: "https://www.pv-magazine-india.com/2026/11/26/india-adds-11-2-gw-of-rooftop-solar-capacity-in-first-nine-months-of-2026/", used: "National average system cost: ₹4.44 crore/MW (Indian TOPCon, DCR) and ₹2.97 crore/MW (Chinese mono PERC)" },
  nasa: { title: "NASA POWER climatology, January 2001 to December 2025", url: "https://power.larc.nasa.gov/", used: "Monthly horizontal irradiance and air temperature at each city centre" },
  portal: { title: "PM Surya Ghar national portal (apply here)", url: "https://pmsuryaghar.gov.in/", used: "Application, vendor list and subsidy claim" },
});

// monthly GHI kWh/m²/day and 2 m air temperature °C, Jan..Dec
const sun = (lat, lon, ghi, temp, annual) => Object.freeze({ lat, lon, ghi, temp, annual, source: "nasa", period: "2001–2025" });

export const CITIES = Object.freeze([
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", aliases: ["hyderabad", "secunderabad"], utilities: ["tgspdcl", "tgnpdcl"],
    sun: sun(17.385, 78.487, [4.8953, 5.7514, 6.2412, 6.6727, 6.6794, 5.4581, 4.6243, 4.5941, 4.877, 5.0405, 4.867, 4.6555], [21.61, 24.85, 28.67, 31.73, 33.3, 28.84, 26.52, 25.53, 25.18, 24.08, 22.07, 20.76], 5.3587) },
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", aliases: ["bengaluru", "bangalore"], utilities: ["bescom"],
    sun: sun(12.972, 77.595, [5.4953, 6.2806, 6.607, 6.5966, 6.222, 5.328, 4.7582, 4.8199, 5.2908, 5.0251, 4.6637, 4.7525], [21.1, 23.52, 26.75, 28.37, 26.97, 24.28, 23.54, 23.31, 23.15, 22.54, 21.14, 20.22], 5.4809) },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", aliases: ["mumbai", "navi mumbai", "bombay"], utilities: ["adani", "tata-mumbai", "best", "msedcl"],
    sun: sun(19.076, 72.878, [4.8833, 5.7439, 6.5887, 7.0786, 7.0942, 5.0006, 3.792, 4.0363, 4.7818, 5.2109, 4.843, 4.5336], [23.19, 25.69, 28.69, 30.73, 31.19, 28.66, 26.63, 26.05, 26.19, 26.22, 24.63, 23.33], 5.2942) },
  { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi", aliases: ["delhi", "new delhi", "gurugram", "gurgaon", "noida", "greater noida", "faridabad", "ghaziabad"], utilities: ["brpl", "bypl", "tpddl", "ndmc", "ncr-other"],
    sun: sun(28.614, 77.209, [3.0898, 4.3471, 5.6489, 6.5806, 6.7116, 6.0862, 5.0071, 4.8852, 5.0578, 4.6646, 3.5796, 3.029], [13.61, 17.4, 23.63, 30.44, 35.05, 35.88, 32.27, 29.79, 28.32, 25.18, 20.08, 15.24], 4.89) },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", aliases: ["chennai", "madras"], utilities: ["tnpdcl"],
    sun: sun(13.083, 80.271, [4.9759, 5.8373, 6.3516, 6.4973, 5.9232, 5.2342, 4.8739, 4.933, 5.0575, 4.6258, 4.241, 4.1784], [24.09, 25.6, 28.43, 30.51, 31.51, 30.6, 29.7, 28.99, 28.28, 27.4, 25.76, 24.41], 5.2224) },
  { id: "pune", name: "Pune", state: "Maharashtra", aliases: ["pune", "pimpri-chinchwad", "pimpri chinchwad"], utilities: ["msedcl"],
    sun: sun(18.52, 73.857, [4.9891, 5.8502, 6.6137, 7.0778, 7.0174, 4.5682, 3.3101, 3.3838, 4.3092, 5.0119, 4.896, 4.6649], [19.85, 22.7, 26.25, 28.93, 28.8, 25.63, 23.92, 23.3, 23.37, 22.9, 21.06, 19.62], 5.1348) },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", aliases: ["ahmedabad"], utilities: ["torrent-ahd", "ugvcl"],
    sun: sun(23.023, 72.571, [4.5986, 5.5704, 6.5563, 7.2874, 7.4782, 6.289, 4.483, 4.2638, 5.2181, 5.6417, 4.6711, 4.2972], [19.93, 23.28, 28.1, 32.56, 35.06, 33.62, 29.8, 28.04, 28.02, 27.17, 24.23, 20.88], 5.5255) },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", aliases: ["kolkata", "calcutta"], utilities: ["cesc", "wbsedcl"],
    sun: sun(22.573, 88.364, [3.7793, 4.693, 5.407, 5.9292, 5.7562, 4.5506, 4.2024, 4.2074, 4.3534, 4.3608, 4.1066, 3.5549], [17.31, 22.01, 27.37, 31.19, 31.53, 29.9, 28.67, 28.24, 27.69, 26.02, 21.89, 17.78], 4.5722) },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", aliases: ["jaipur"], utilities: ["jvvnl"],
    sun: sun(26.912, 75.787, [4.0332, 5.1002, 6.1853, 7.009, 7.1974, 6.5304, 5.3146, 4.9838, 5.5075, 5.3098, 4.2439, 3.8292], [14.51, 18.04, 23.9, 30.1, 34.21, 34.57, 31.17, 28.83, 28.08, 25.79, 21.09, 16.33], 5.4355) },
  { id: "surat", name: "Surat", state: "Gujarat", aliases: ["surat"], utilities: ["torrent-surat", "dgvcl"],
    sun: sun(21.17, 72.831, [4.6958, 5.6074, 6.5263, 7.1734, 7.303, 5.7326, 4.3018, 4.2264, 4.9469, 5.3599, 4.675, 4.3478], [22.94, 25.21, 28.6, 31.48, 32.3, 29.95, 27.39, 26.62, 26.85, 26.79, 25.48, 23.78], 5.4041) },
]);
export const cityById = Object.fromEntries(CITIES.map((c) => [c.id, c]));

const DERC_TARIFF = Object.freeze({
  version: "DERC schedule FY2020-21 / FY2021-22", source: "derc", confidence: "Published schedule, surcharges excluded",
  slabs: [[200, 3], [400, 4.5], [800, 6.5], [1200, 7], [Infinity, 8]],
  // ₹ per kW of sanctioned load per month, by load band [upper kW, rate]
  fixedBands: [[2, 20], [5, 50], [15, 100], [25, 200], [Infinity, 250]],
  excludes: "Power purchase adjustment charge, pension surcharge, electricity duty and the Delhi government's consumer subsidy are not modelled.",
});
const BESCOM_TARIFF = Object.freeze({
  version: "KERC Combined Tariff Order 2025, FY2026-27", source: "kerc", confidence: "Published rate, surcharges excluded",
  slabs: [[Infinity, 5.8]], fixedBands: [[Infinity, 150]],
  excludes: "Electricity tax, pension and gratuity surcharge, true-up charges, fuel adjustments and the Gruha Jyothi free-unit scheme are not modelled.",
});
const DELHI_NET = Object.freeze({ type: "net", source: "bsesFaq", note: "Exported units are set off monthly and surplus carries forward. Surplus left at the end of the financial year is paid at the regulator's average power purchase cost. Enter that rate if you know it; otherwise it counts as ₹0." });

// tariff: null means we have not verified a complete domestic schedule. net: null means the
// export-settlement rule is unverified, so exports are worth ₹0 unless the user enters a rate.
const u = (name, extra = {}) => Object.freeze({ name, tariff: null, net: null, ...extra });
export const UTILITIES = Object.freeze({
  tgspdcl: u("TGSPDCL", { area: "Southern Telangana, incl. most of Hyderabad" }),
  tgnpdcl: u("TGNPDCL", { area: "Northern Telangana" }),
  bescom: u("BESCOM", { tariff: BESCOM_TARIFF }),
  adani: u("Adani Electricity Mumbai"), "tata-mumbai": u("Tata Power (Mumbai)"), best: u("BEST"), msedcl: u("MSEDCL"),
  brpl: u("BSES Rajdhani (BRPL)", { tariff: DERC_TARIFF, net: DELHI_NET, delhi: true }),
  bypl: u("BSES Yamuna (BYPL)", { tariff: DERC_TARIFF, net: DELHI_NET, delhi: true }),
  tpddl: u("Tata Power-DDL", { tariff: DERC_TARIFF, net: DELHI_NET, delhi: true }),
  ndmc: u("NDMC", { delhi: true }),
  "ncr-other": u("Other NCR utility (Haryana or Uttar Pradesh)"),
  tnpdcl: u("TNPDCL (Tamil Nadu)"),
  "torrent-ahd": u("Torrent Power (Ahmedabad)"), ugvcl: u("UGVCL"),
  cesc: u("CESC"), wbsedcl: u("WBSEDCL"), jvvnl: u("JVVNL (Jaipur Discom)"),
  "torrent-surat": u("Torrent Power (Surat)"), dgvcl: u("DGVCL"),
});

export const PRICES = Object.freeze({
  verified: VERIFIED,
  // ₹ per kW, installed. [upper kW, rate]
  delhiIndicative: { source: "bsesFaq", dated: "September 2025", bands: [[5, 65000], [10, 60000], [Infinity, 55000]] },
  national: { source: "mercom", dated: "Q3 2026", dcr: 44400, nonDcr: 29700 },
});

export const SUBSIDY_RULES = Object.freeze({
  version: "PMSG-CFA as published by BSES, Sep 2025", source: "bsesFaq",
  central: { firstKw: 2, firstRate: 30000, nextKw: 1, nextRate: 18000, ghsRate: 18000, ghsKwPerHouse: 3, ghsMaxKw: 500 },
  delhiCapital: { perKw: 10000, cap: 30000, ghsPerKw: 2000 },
  delhiGbi: { from: "2024-03-14", to: "2027-03-13", years: 5, bands: [[3, 3], [10, 2]] },
});

export const ELIGIBILITY = Object.freeze([
  ["connection", "The property has its own electricity connection that can take net metering"],
  ["grid", "The system will be grid-connected and approved by the utility"],
  ["dcr", "Modules and cells are Indian-made (Domestic Content Requirement)"],
  ["vendor", "An MNRE-empanelled vendor will install it"],
  ["noPrior", "No central rooftop subsidy was already claimed for this connection"],
]);

export const PRODUCTS = Object.freeze({
  solar: { id: "solar", name: "welOS Solar", panels: true, intelligence: false, segments: ["home", "ghs"],
    line: "Approved grid-connected solar with the inverter maker's basic performance view.",
    suits: "A home or housing society that wants the lowest-cost approved system.",
    hardware: ["PV modules", "Grid-tied inverter", "Mounting structure", "Protection, cabling, earthing"] },
  intelligence: { id: "intelligence", name: "welOS Solar + Intelligence", panels: true, intelligence: true, segments: ["home", "ghs"],
    line: "The same grid-connected system with welOS monitoring and maintenance intelligence.",
    suits: "Owners who want faults and soiling surfaced early. The welOS layer is not yet priced.",
    hardware: ["Everything in welOS Solar", "welOS controller (planned)", "Energy meter and soiling reference (planned)"] },
  core: { id: "core", name: "welOS Core", panels: false, intelligence: true, segments: ["home", "ghs", "commercial"],
    line: "Battery-free monitoring and fault triage for a compatible solar system you already own.",
    suits: "An existing installation. No new panels, no subsidy, compatibility check required.",
    hardware: ["welOS controller (planned)", "Meter and communications (planned)", "No panels, inverter or battery"] },
  commercial: { id: "commercial", name: "welOS Commercial", panels: true, intelligence: true, segments: ["commercial"],
    line: "Grid-connected solar for commercial roofs and multi-site portfolios.",
    suits: "Businesses with daytime load. No residential subsidy applies.",
    hardware: ["PV modules", "String inverters", "Mounting and protection", "welOS site monitoring (planned)"] },
});

// What the welOS layer does today. Nothing is claimed as shipping hardware.
export const CAPABILITIES = Object.freeze([
  ["Generation monitoring", "Demonstrated on simulated data"],
  ["Performance diagnostics", "Planned"],
  ["Fault detection", "Rules demonstrated in simulation"],
  ["Soiling estimation", "Demonstrated on simulated data"],
  ["Maintenance recommendations", "Planned"],
  ["Service records", "Planned"],
  ["Equipment health indicators", "Planned"],
]);
export const FUTURE_MODULES = Object.freeze(["Vertical-axis wind module", "Integrated rainwater harvesting", "Automated panel washing"]);
