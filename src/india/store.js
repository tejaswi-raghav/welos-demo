// India builds live under their own key. The UAE build (welos.build.v1) is never read or written here.
import { DEFAULTS, normalise } from "./engine.js";

export const INDIA_KEY = "welos.build.in.v1";
export const SCHEMA = 1;
const store = () => { try { return globalThis.localStorage || null; } catch { return null; } };

/** Only keys we know are saved, so coordinates or other extras can never slip in. */
export function serialise(input) {
  const s = normalise(input);
  const build = Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, s[k]]));
  return { schema: SCHEMA, region: "IN", currency: "INR", build };
}
export function parse(raw) {
  try {
    const d = JSON.parse(raw);
    if (d?.region !== "IN" || d.currency !== "INR" || d.schema !== SCHEMA || !d.build) return null;
    return serialise(d.build).build;
  } catch { return null; }
}
export const saveIndia = (input, s = store()) => { try { s?.setItem(INDIA_KEY, JSON.stringify(serialise(input))); } catch { /* storage unavailable */ } };
export const loadIndia = (s = store()) => { try { return parse(s?.getItem(INDIA_KEY)); } catch { return null; } };
