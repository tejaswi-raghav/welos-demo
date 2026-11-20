// Exports every WELOS identity variant to /public/brand as SVG + PNG.
// Run: npm run brand:export   (Node >= 22.6, uses --experimental-strip-types)
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const g = await import(path.join(root, "lib/brand/geometry.ts"));
const { palette: p } = g;
const outDir = path.join(root, "public/brand");
fs.mkdirSync(outDir, { recursive: true });

const onLight = { ink: p.carbonBlack, quantum: p.energyOrange };
const onDark = { ink: p.solarWhite, quantum: p.solarYellow };
const mono = { ink: p.carbonBlack, quantum: p.carbonBlack };
const monoWhite = { ink: "#FFFFFF", quantum: "#FFFFFF" };

const variants = {
  "welos-horizontal-light": g.wordmarkSVG({ ...onLight, bg: "#FFFFFF" }),
  "welos-horizontal-dark": g.wordmarkSVG({ ...onDark, bg: p.carbonBlack }),
  "welos-horizontal-transparent-dark-ink": g.wordmarkSVG(onLight),
  "welos-horizontal-transparent-light-ink": g.wordmarkSVG(onDark),
  "welos-horizontal-mono-black": g.wordmarkSVG(mono),
  "welos-horizontal-mono-white": g.wordmarkSVG(monoWhite),
  "welos-stacked-light": g.stackedSVG({ ...onLight, bg: "#FFFFFF" }),
  "welos-stacked-dark": g.stackedSVG({ ...onDark, bg: p.carbonBlack }),
  "welos-stacked-mono-black": g.stackedSVG(mono),
  "welos-emblem-light": g.emblemSVG({ ...onLight, bg: "#FFFFFF" }),
  "welos-emblem-dark": g.emblemSVG({ ...onDark, bg: p.carbonBlack }),
  "welos-emblem-mono-black": g.emblemSVG(mono),
  "welos-emblem-mono-white": g.emblemSVG(monoWhite),
  "welos-app-icon": g.emblemSVG({ ...onDark, bg: p.carbonBlack }, true),
  "welos-app-icon-light": g.emblemSVG({ ...onLight, bg: p.solarWhite }, true),
};

const pngWidths = { horizontal: [512, 1024, 2048], stacked: [512, 1024], emblem: [256, 512], "app-icon": [32, 180, 192, 512, 1024] };

for (const [name, svg] of Object.entries(variants)) {
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg);
  const key = Object.keys(pngWidths).find((k) => name.includes(k)) ?? "emblem";
  for (const w of pngWidths[key]) {
    const png = new Resvg(svg, { fitTo: { mode: "width", value: w } }).render().asPng();
    fs.writeFileSync(path.join(outDir, `${name}@${w}.png`), png);
  }
}

// Favicon + touch icons used by the app router
const icon = variants["welos-app-icon"];
fs.writeFileSync(path.join(root, "app/icon.svg"), icon);
fs.writeFileSync(path.join(root, "app/apple-icon.png"), new Resvg(icon, { fitTo: { mode: "width", value: 180 } }).render().asPng());
fs.writeFileSync(path.join(root, "public/icon-192.png"), new Resvg(icon, { fitTo: { mode: "width", value: 192 } }).render().asPng());
fs.writeFileSync(path.join(root, "public/icon-512.png"), new Resvg(icon, { fitTo: { mode: "width", value: 512 } }).render().asPng());

console.log(`Exported ${Object.keys(variants).length} variants to public/brand`);
