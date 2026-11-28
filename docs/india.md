# India mode

Pages: `/india.html` (configurator) and `/india-cities.html` (city comparison and price explorer).
The UAE | India switch changes market. The market is never inferred; "Use my location" only suggests, and asks for confirmation.

## Files
| File | Role |
|---|---|
| `src/india/data.js` | Versioned regional data, sources and verification date. No formulas |
| `src/india/engine.js` | Pure calculations; the page, charts, recommendations and downloads all read `evaluate()` |
| `src/india/store.js` | Saved build `welos.build.in.v1` (schema 1). `welos.build.v1` (UAE) is never read or written |
| `src/india/location.js`, `api/reverse.js` | Geolocation and reverse geocoding |
| `src/india/chrome-html.js` | India header and footer, market switch (composed in `vite.config.js`) |

No file in the protected UAE baseline was edited. The UAE product page's built header gains the market switch through `vite.config.js`.

## What is verified (checked 2026-11-28)
| Item | State |
|---|---|
| Central subsidy and eligibility conditions | BSES Delhi FAQ, Sep 2025. Recheck against MNRE before quoting |
| Delhi capital subsidy and generation incentive | Same FAQ. Incentive window ends 2027-03-13 |
| Delhi domestic tariff (BRPL, BYPL, TPDDL) | DERC schedule FY2020-21 / FY2021-22. **Confirm no later order replaces it** |
| Bengaluru domestic tariff | KERC 2025 order, FY2026-27, read from a search extract of the official file |
| Other tariffs, all non-domestic tariffs | Not verified. User enters an average rate |
| Export settlement outside Delhi homes | Not verified. Worth ₹0 unless entered |
| State subsidies outside Delhi | Not verified. None applied |
| Delhi installed price | BSES indicative per-kW figures |
| Other installed prices | Indicative range from national average (Mercom Q3 2026) to the Delhi figure; midpoint is a model choice. Commercial uses the non-DCR average as low end |
| Component prices, taxes, utility fees | Not available. Shown as "confirm in quote" |
| welOS controller and service fee | Not priced |
| Sunlight and temperature | NASA POWER 2001–2025, ten cities |

## Model assumptions
Performance ratio 0.86 less temperature, soiling (4%), shading (5%) and orientation factors; tilt gain not modelled; ±10% planning band.
8 m² per kW. 550 W modules. 0.5%/yr ageing. 25 years. 3 kW sanctioned load when not entered. 40% daytime use where netting is unverified.
Maintenance and year-12 inverter replacement default to ₹0 and are flagged. No financing, discounting or tariff escalation.

## Location privacy
Requested only on click, once, never watched. Rounded to 2 decimals in the browser, sent to `/api/reverse`, forwarded to OpenStreetMap Nominatim. Not stored or logged by the app; response is `no-store`. The hosting provider's request logs may still contain the query string. Nominatim's public service has strict usage limits; use a contracted geocoder before real traffic.

## Updating data
Edit `data.js`, change `DATA_VERSION` and `VERIFIED`, run `npm run test:india`. The page warns after 180 days.

## Not included
Optional cities (Lucknow, Chandigarh, Kochi, Visakhapatnam, Indore, Nagpur); India support in the AI advisor and owner OS; "Use my location" on the UAE page; any battery, water, wind or cleaning price.
