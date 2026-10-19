#!/usr/bin/env node
// contrast-check.mjs: WCAG contrast of the M3 role pairs in a theme.css, light and dark.
//
// Usage: node contrast-check.mjs [theme.css] [--json]
// Default file: ../assets/theme.css. Exit code: 1 if any pair fails, else 0.
//
// Reads --md-sys-color-* hex values (plain or light-dark(LIGHT, DARK)) and checks
// text pairs against 4.5:1 and outline pairs against 3:1.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const json = args.includes("--json");
const file = args.find((a) => !a.startsWith("--")) || join(dirname(fileURLToPath(import.meta.url)), "../assets/theme.css");

const css = readFileSync(file, "utf8");
const colors = {}; // role -> { light, dark }
const re = /--md-sys-color-([\w-]+):\s*(?:light-dark\(\s*(#[0-9a-f]{3,8})\s*,\s*(#[0-9a-f]{3,8})\s*\)|(#[0-9a-f]{3,8}))\s*;/gi;
for (const m of css.matchAll(re)) colors[m[1]] = { light: m[2] || m[4], dark: m[3] || m[4] };

const lum = (hex) => {
  let h = hex.slice(1);
  if (h.length < 6) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio]
const PAIRS = [];
for (const r of ["primary", "secondary", "tertiary", "error"]) {
  PAIRS.push([`on-${r}`, r, 4.5], [`on-${r}-container`, `${r}-container`, 4.5]);
}
PAIRS.push(
  ["on-background", "background", 4.5],
  ["on-surface-variant", "surface-variant", 4.5],
  ["inverse-on-surface", "inverse-surface", 4.5],
  ["inverse-primary", "inverse-surface", 3],
);
for (const s of ["surface", "surface-dim", "surface-bright", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"]) {
  PAIRS.push(["on-surface", s, 4.5], ["on-surface-variant", s, 4.5]);
}
PAIRS.push(["primary", "surface", 4.5], ["outline", "surface", 3]);

const results = [];
for (const [fg, bg, min] of PAIRS) {
  if (!colors[fg] || !colors[bg]) continue;
  for (const mode of ["light", "dark"]) {
    const value = ratio(colors[fg][mode], colors[bg][mode]);
    results.push({ fg, bg, mode, ratio: +value.toFixed(2), min, pass: value >= min });
  }
}

const failed = results.filter((r) => !r.pass);
if (json) {
  console.log(JSON.stringify({ file, checked: results.length, failed }, null, 2));
} else {
  for (const r of failed) console.log(`FAIL ${r.mode.padEnd(5)} ${r.fg} on ${r.bg}: ${r.ratio}:1 (needs ${r.min}:1)`);
  console.log(`${results.length - failed.length}/${results.length} pairs pass (${file})`);
}
process.exit(failed.length ? 1 : 0);
