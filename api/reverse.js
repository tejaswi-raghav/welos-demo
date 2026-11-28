// Reverse geocoding for "Use my location". The coordinate is rounded to about 1 km, sent to
// OpenStreetMap Nominatim, and neither logged nor cached by this function.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  const { lat: a, lon: b } = req.query || {};
  const lat = Number(a), lon = Number(b);
  if (a == null || a === "" || b == null || b === "" || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ error: "Valid latitude and longitude are required." });
  }
  res.setHeader("Cache-Control", "no-store");
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", lat.toFixed(2));
    url.searchParams.set("lon", lon.toFixed(2));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("zoom", "10");
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WELOSConfigurator/1.0 (https://welos-demo.vercel.app/; contact: tejaswi-raghav via GitHub)",
        Referer: "https://welos-demo.vercel.app/", "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("lookup failed");
    const x = (await response.json()).address || {};
    return res.status(200).json({
      place: { countryCode: x.country_code || "", country: x.country || "", state: x.state || "", city: x.city || x.town || x.municipality || x.village || "", district: x.state_district || x.county || "" },
      attribution: "© OpenStreetMap contributors",
    });
  } catch {
    return res.status(502).json({ error: "Place lookup is temporarily unavailable." });
  }
}
