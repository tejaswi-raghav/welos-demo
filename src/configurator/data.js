/**
 * Climate + place lookups. On Vercel the /api functions proxy these services;
 * on static hosts (GitHub Pages, VITE_STATIC=1) the browser calls NASA POWER
 * and OpenStreetMap Nominatim directly — both allow cross-origin requests.
 */
const STATIC = import.meta.env.VITE_STATIC === "1";
const PARAMETERS = ["ALLSKY_SFC_SW_DWN", "WS10M", "RH2M", "PRECTOTCORR", "T2M"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

async function viaApi(path) {
  const response = await fetch(path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "Lookup failed."), { status: response.status });
  return data;
}

async function climateDirect(lat, lon) {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.searchParams.set("parameters", PARAMETERS.join(","));
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", Number(lon).toFixed(3));
  url.searchParams.set("latitude", Number(lat).toFixed(3));
  url.searchParams.set("format", "JSON");
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error("Climate data is temporarily unavailable. You can still configure manually.");
  const data = await response.json();
  const p = data.properties?.parameter;
  const metric = (key) => {
    const value = Number(p?.[key]?.ANN);
    if (!Number.isFinite(value) || value <= -900) throw new Error("Climate data is incomplete for this location.");
    return value;
  };
  return {
    climate: {
      solarDailyKwhM2: metric("ALLSKY_SFC_SW_DWN"),
      windMs: metric("WS10M"),
      humidityPct: metric("RH2M"),
      rainMmYear: Math.round(metric("PRECTOTCORR") * 365.25),
      tempC: metric("T2M"),
    },
    monthly: MONTHS.map((month) => ({
      month,
      solarDailyKwhM2: Number(p.ALLSKY_SFC_SW_DWN[month]),
      windMs: Number(p.WS10M[month]),
      rainDailyMm: Number(p.PRECTOTCORR[month]),
    })),
    source: "NASA POWER",
    period: data.header?.range || "2001–2020 climatology",
  };
}

async function placeDirect(q) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  const response = await fetch(url, { headers: { "Accept-Language": "en" }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Place search is temporarily unavailable. Try coordinates instead.");
  const results = (await response.json())
    .map((place) => ({ name: place.display_name, lat: Number(place.lat), lon: Number(place.lon) }))
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon));
  return { results, attribution: "© OpenStreetMap contributors" };
}

export async function fetchClimate(lat, lon) {
  if (!STATIC) {
    try { return await viaApi(`api/climate?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`); }
    catch (error) { if (error.status && error.status !== 404) throw error; }
  }
  return climateDirect(lat, lon);
}

export async function searchPlace(q) {
  if (!STATIC) {
    try { return await viaApi(`api/location?q=${encodeURIComponent(q)}`); }
    catch (error) { if (error.status && error.status !== 404) throw error; }
  }
  if (q.length < 2 || q.length > 80) throw new Error("Enter a place name (2–80 characters).");
  return placeDirect(q);
}
