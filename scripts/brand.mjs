// Generates all WELOS logo files from src/landing/brand.js → public/brand
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import * as b from "../src/landing/brand.js";
const out = new URL("../public/brand", import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });
const files = {
  "welos-emblem.svg": b.emblemSVG({ id: "em" }),
  "welos-emblem-mono-white.svg": b.emblemSVG({ id: "mw", mono: "#F5F5F5" }),
  "welos-emblem-mono-black.svg": b.emblemSVG({ id: "mb", mono: "#0B0B0B" }),
  "welos-logo.svg": b.lockupSVG({ ink: "#F5F5F5", id: "lo" }),
  "welos-logo-ink.svg": b.lockupSVG({ ink: "#0B0B0B", id: "li" }),
  "welos-logo-mono-white.svg": b.lockupSVG({ ink: "#F5F5F5", id: "lm", mono: "#F5F5F5" }),
  "welos-logo-stacked.svg": b.stackedSVG({ ink: "#F5F5F5", id: "sk" }),
  "welos-wordmark.svg": b.wordmarkSVG("#F5F5F5"),
  "welos-app-icon.svg": b.tileSVG({ id: "ai" }),
};
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(`${out}/${name}`, svg);
const png = (svg, w) => new Resvg(svg, { fitTo: { mode: "width", value: w } }).render().asPng();
fs.writeFileSync(`${out}/welos-logo@2048.png`, png(files["welos-logo.svg"], 2048));
fs.writeFileSync(`${out}/welos-emblem@1024.png`, png(files["welos-emblem.svg"], 1024));
fs.writeFileSync(`${out}/welos-app-icon@512.png`, png(files["welos-app-icon.svg"], 512));
fs.writeFileSync(new URL("../public/favicon.svg", import.meta.url).pathname, files["welos-app-icon.svg"]);
fs.writeFileSync(new URL("../public/apple-touch-icon.png", import.meta.url).pathname, png(files["welos-app-icon.svg"], 180));
fs.writeFileSync(new URL("../public/welos-brand-transparent.png", import.meta.url).pathname, png(files["welos-emblem.svg"], 512));
console.log("brand files:", Object.keys(files).length + 6);
