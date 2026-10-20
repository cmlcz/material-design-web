#!/usr/bin/env node
// lint-tokens.mjs: find off-system styling in UI source files.
//
// Usage: node lint-tokens.mjs <file-or-dir> [...more] [--json]
// Exit code: 1 if any "error" finding, else 0.
//
// It flags things that bypass Material 3 tokens: raw colors, Tailwind default
// palette / type / radius / shadow / breakpoint classes, arbitrary values,
// component-level dark: classes, and a few accessibility smells. Every hit is
// a lead to read, not a verdict.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const EXT = new Set([".html", ".htm", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte", ".astro", ".css", ".scss", ".php", ".erb", ".njk", ".hbs", ".liquid", ".mdx"]);
const SKIP_DIR = new Set(["node_modules", ".git", "dist", "build", ".next", ".nuxt", ".svelte-kit", "coverage", ".turbo", "out"]);

const PALETTE = "slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_PREFIX = "bg|text|border(?:-[trblxyse])?|ring|ring-offset|fill|stroke|outline|from|to|via|divide|shadow|accent|caret|decoration|placeholder";

// [id, severity, regex, message]
const RULES = [
  ["raw-color-class", "error", new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_PREFIX})-\\[(?:#|rgb|hsl|oklch|oklab|lab|color(?!-mix\\(in_\\w+,var\\(--md-sys-))\\S*?\\]`, "g"), "Arbitrary color: use a role class (bg-primary, text-on-surface-variant...)"],
  ["default-palette", "error", new RegExp(`(?<![\\w-])(?:[\\w-]+:)*(?:${COLOR_PREFIX})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?:\\/\\d+)?(?![\\w-])`, "g"), "Tailwind default palette: replace with an M3 role (see references/foundations/color.md)"],
  ["default-type", "warn", /(?<![\w-])(?:[\w-]+:)*text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\w-])/g, "Tailwind default font size: use a type role (text-body-large, text-title-medium...)"],
  ["arbitrary-type", "warn", /(?<![\w-])(?:[\w-]+:)*text-\[\d+(?:\.\d+)?(?:px|rem|em)\]/g, "Arbitrary font size: use a type role (allowed only for icon glyph sizes)"],
  ["default-radius", "warn", /(?<![\w-])(?:[\w-]+:)*rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:none|xs|sm|md|lg|xl|2xl|3xl|4xl|full))?(?=["'`\s}])/g, "Tailwind default radius: use rounded-corner-<size>"],
  ["arbitrary-radius", "warn", /(?<![\w-])(?:[\w-]+:)*rounded(?:-[a-z]{1,2})?-\[[^\]]+\]/g, "Arbitrary radius: use rounded-corner-<size>"],
  ["default-shadow", "warn", /(?<![\w-])(?:[\w-]+:)*shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?(?=["'`\s}])/g, "Tailwind default shadow: use shadow-elevation-<1-5> or tonal surface tiers"],
  ["arbitrary-spacing", "warn", /(?<![\w-])(?:[\w-]+:)*-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[\d+(?:\.\d+)?px\]/g, "Arbitrary spacing: use the 4px spacing scale (p-4 = 16px)"],
  ["default-breakpoint", "warn", /(?<![\w-])(?:sm|md|lg|xl|2xl):[\w[-]/g, "Tailwind default breakpoint: use window size classes medium: / expanded: / large: / extra-large:"],
  ["dark-variant", "warn", /(?<![\w-])dark:[\w[-]/g, "Component-level dark: class: themes swap role variables; fix the token instead"],
  ["outline-none", "warn", /(?<![\w-])(?:focus:)?outline-none(?![\w-])/g, "outline-none: make sure focus-ring (or another visible focus style) is present on this element"],
  ["div-click", "error", /<(?:div|span|li|td)\b[^>]*\s(?:onClick|onclick|@click|v-on:click|on:click)\s*=/g, "Clickable non-interactive element: use <button> or <a href>"],
  ["img-no-alt", "error", /<img\b(?![^>]*\balt\s*=)[^>]*>/g, "Image without alt: add alt text, or alt=\"\" if decorative"],
  ["uppercase", "info", /(?<![\w-])uppercase(?![\w-])/g, "uppercase: M3 UI text is sentence case"],
];

// Raw colors in CSS / style attributes (outside custom-property definitions).
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/g;

function walk(p, out) {
  let st;
  try { st = statSync(p); } catch { return; }
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) if (!SKIP_DIR.has(name)) walk(join(p, name), out);
  } else if (EXT.has(extname(p).toLowerCase())) out.push(p);
}

// The class attribute (or tag) around an offset, so a class list wrapped over
// several lines is judged as a whole.
function enclosingAttr(text, offset) {
  const start = Math.max(text.lastIndexOf("class=", offset), text.lastIndexOf("className=", offset), text.lastIndexOf("<", offset));
  const quote = text.slice(start).search(/["'`]\s*(?:\/?>|\s[\w:@-]+=)/);
  return text.slice(start, quote < 0 ? offset + 400 : start + quote + 1);
}

const EXEMPT = {
  // A visible replacement focus style, or an element that only takes programmatic focus.
  "outline-none": /focus-ring|(?:focus|focus-visible|focus-within|peer-focus|group-focus):(?:outline-\d|ring-|border-|before:opacity)|tabindex=["']?-1/,
  // Icon glyph sizes are allowed arbitrary values (icons are not type roles).
  "arbitrary-type": /material-symbols|material-icons|\bicon\b/,
};

// Tailwind browser build: an `@import` anywhere in a text/tailwindcss block (even in
// a comment) turns off its automatic Tailwind import, so no utilities are generated.
function browserImportFindings(file, text) {
  const out = [];
  for (const m of text.matchAll(/<style[^>]*type=["']text\/tailwindcss["'][^>]*>([\s\S]*?)<\/style>/g)) {
    const css = m[1];
    const real = css.replace(/\/\*[\s\S]*?\*\//g, "");
    if (/@import/.test(css) && !/@import\s+["']tailwindcss["']/.test(real)) {
      out.push({ file, line: text.slice(0, m.index).split(/\r?\n/).length, rule: "tw-browser-import", severity: "error", match: "<style type=\"text/tailwindcss\">", message: "Block mentions @import but has no real @import \"tailwindcss\": the browser build will generate no utilities. Add @import \"tailwindcss\"; as the first line (tailwind/setup.md)" });
    }
  }
  return out;
}

// Google's Material Symbols CSS sets display: inline-block outside any cascade layer,
// so display utilities on the icon element itself never win.
function iconDisplayFindings(file, text) {
  const out = [];
  for (const m of text.matchAll(/class(?:Name)?=["'`]([^"'`]*\bmaterial-(?:symbols|icons)[\w-]*[^"'`]*)["'`]/g)) {
    const hit = m[1].match(/(?<![\w-])(?:[\w-]+:)*(?:hidden|inline|block|inline-block|inline-flex|flex|grid|inline-grid|contents)(?![\w-])/);
    if (hit) out.push({ file, line: text.slice(0, m.index).split(/\r?\n/).length, rule: "icon-display", severity: "error", match: hit[0], message: "Display utility on a Material Symbols span is overridden by Google's unlayered font CSS: move it to a wrapper <span> (tailwind/setup.md)" });
  }
  return out;
}

function lintFile(file) {
  const text = readFileSync(file, "utf8");
  const isCss = /\.(s?css)$/i.test(file);
  const findings = [...browserImportFindings(file, text), ...iconDisplayFindings(file, text)];
  const lines = text.split(/\r?\n/);
  let offset = 0;
  lines.forEach((line, i) => {
    const ln = i + 1;
    const lineStart = offset;
    offset += line.length + 1;
    if (/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) return; // comments describe, they don't style
    for (const [id, severity, re, message] of RULES) {
      if (isCss && ["div-click", "img-no-alt"].includes(id)) continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line))) {
        if (EXEMPT[id] && EXEMPT[id].test(enclosingAttr(text, lineStart + m.index))) continue;
        // Focus shown by a container (has-focus-visible: on an ancestor a few lines up).
        if (id === "outline-none" && /has-focus-visible:(?:outline|ring)/.test(text.slice(Math.max(0, lineStart - 600), lineStart + m.index))) continue;
        findings.push({ file, line: ln, rule: id, severity, match: m[0].trim(), message });
      }
    }
    // Raw colors: CSS files and inline style attributes, skipping token definitions.
    const isTokenDef = /^\s*--[\w-]+\s*:/.test(line) || /light-dark\(/.test(line);
    const inStyle = /style\s*=\s*["'{]/.test(line);
    if (!isTokenDef && (isCss || inStyle)) {
      RAW_COLOR.lastIndex = 0;
      let m;
      while ((m = RAW_COLOR.exec(line))) {
        findings.push({ file, line: ln, rule: "raw-color", severity: "error", match: m[0], message: "Raw color value: use var(--md-sys-color-<role>) or a role class" });
      }
    }
  });
  return findings;
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const targets = args.filter((a) => a !== "--json");
if (!targets.length) {
  console.error("Usage: node lint-tokens.mjs <file-or-dir> [...] [--json]");
  process.exit(2);
}

const files = [];
for (const t of targets) walk(t, files);
const all = files.flatMap(lintFile);

if (asJson) {
  console.log(JSON.stringify({ files: files.length, findings: all }, null, 2));
} else {
  const cwd = process.cwd();
  for (const f of all) {
    console.log(`${relative(cwd, f.file)}:${f.line}  ${f.severity.toUpperCase().padEnd(5)} ${f.rule.padEnd(18)} ${f.match}\n      → ${f.message}`);
  }
  const count = (s) => all.filter((f) => f.severity === s).length;
  console.log(`\n${files.length} files · ${count("error")} errors · ${count("warn")} warnings · ${count("info")} info`);
}
process.exit(all.some((f) => f.severity === "error") ? 1 : 0);
