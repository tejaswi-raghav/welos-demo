// Maps a reverse-geocoded address to a market. Pure; the browser and API live elsewhere.
import { CITIES } from "./data.js";

const EMIRATES = { dubai: "dubai", "abu dhabi": "abu-dhabi", sharjah: "sharjah", ajman: "ajman", "ras al khaimah": "rak", "ras al-khaimah": "rak", fujairah: "fujairah" };
const norm = (x) => String(x || "").toLowerCase().replace(/ emirate| district| division/g, "").trim();
export function km(a, b, c, d) {
  const r = Math.PI / 180, x = (d - b) * r * Math.cos(((a + c) / 2) * r), y = (c - a) * r;
  return Math.hypot(x, y) * 6371;
}
export const NEARBY_KM = 60;

/**
 * place: { countryCode, state, city, district, lat, lon }
 * → { status: "india" | "uae" | "nearby" | "unsupported-city" | "unsupported-country", ... }
 */
export function matchPlace(place = {}) {
  const code = norm(place.countryCode), city = norm(place.city), district = norm(place.district), state = norm(place.state);
  const label = [place.city || place.district, place.state, place.country].filter(Boolean).join(", ") || "Unknown place";
  if (code === "ae") {
    const names = [state, city, district];
    if (names.includes("al ain") || city.includes("al ain")) return { status: "uae", region: "al-ain", label };
    const region = names.map((n) => EMIRATES[n]).find(Boolean);
    return region ? { status: "uae", region, label } : { status: "unsupported-city", country: "uae", label };
  }
  if (code !== "in") return { status: "unsupported-country", label };
  const exact = CITIES.find((c) => c.aliases.includes(city)) || CITIES.find((c) => c.aliases.includes(district));
  if (exact) {
    const outsideDelhi = exact.id === "delhi-ncr" && state && state !== "delhi";
    // several licensees may serve one city, so the utility is only preset when there is no choice
    const utility = outsideDelhi ? "ncr-other" : exact.utilities.length === 1 ? exact.utilities[0] : null;
    return { status: "india", city: exact.id, utility, confirmUtility: !utility, label };
  }
  if (Number.isFinite(place.lat) && Number.isFinite(place.lon)) {
    const near = CITIES.filter((c) => norm(c.state) === state)
      .map((c) => ({ c, d: km(place.lat, place.lon, c.sun.lat, c.sun.lon) })).sort((a, b) => a.d - b.d)[0];
    if (near && near.d <= NEARBY_KM) return { status: "nearby", city: near.c.id, distanceKm: Math.round(near.d), label };
  }
  return { status: "unsupported-city", country: "india", label };
}

/** Ask the browser once (never watches), then our own API. Coordinates are rounded and not kept. */
export async function detectPlace({ geolocation = globalThis.navigator?.geolocation, fetcher = globalThis.fetch, timeout = 10000 } = {}) {
  if (!geolocation) throw new Error("This browser cannot share a location. Choose your city instead.");
  const position = await new Promise((resolve, reject) => geolocation.getCurrentPosition(resolve, (e) => reject(new Error(
    e.code === 1 ? "Location permission was declined. Choose your city instead." : e.code === 3 ? "Finding your location took too long. Choose your city instead." : "Your location is unavailable right now. Choose your city instead.")), { timeout, maximumAge: 0, enableHighAccuracy: false }));
  const lat = Math.round(position.coords.latitude * 100) / 100, lon = Math.round(position.coords.longitude * 100) / 100;
  let response;
  try { response = await fetcher(`/api/reverse?lat=${lat}&lon=${lon}`, { signal: AbortSignal.timeout(timeout) }); }
  catch { throw new Error("The place lookup did not respond. Choose your city instead."); }
  if (!response.ok) throw new Error("The place lookup is unavailable. Choose your city instead.");
  const { place } = await response.json();
  return matchPlace({ ...place, lat, lon });
}
