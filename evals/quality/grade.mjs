// grade.mjs: scripted assertions for material-design-web.
// Usage: node grade.mjs [iteration-dir] [eval-name...]  -> writes grading.json per run + prints a table.
// Checks marked [browser] render the output in headless Chrome (browser.mjs); without Chrome they fail with the reason.
import { readFileSync, readdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { render } from "./browser.mjs";

const WS = dirname(fileURLToPath(import.meta.url));
const IT = process.argv[2] || join(WS, "iteration-1");
const LINT = join(WS, "../../scripts/lint-tokens.mjs");

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
function mainFile(out, preferred) {
  if (preferred && existsSync(join(out, preferred))) return join(out, preferred);
  const html = readdirSync(out).filter((f) => /\.html?$/.test(f));
  return html.length ? join(out, html[0]) : null;
}
function lint(file) {
  try {
    const r = execFileSync("node", [LINT, file, "--json"], { encoding: "utf8" });
    return JSON.parse(r);
  } catch (e) {
    try { return JSON.parse(e.stdout); } catch { return null; }
  }
}
const countErrors = (l) => (l ? (l.findings || l).filter((f) => f.severity === "error").length : -1);
const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, "");
const m3Roles = (s) => (s.match(/(?<![\w-])(?:bg|text|border|fill|ring|outline)-(?:primary|secondary|tertiary|error|surface|on-[a-z-]+|outline|inverse-[a-z-]+)(?:-[a-z-]+)?(?![\w-])/g) || []).length;
const darkClasses = (s) => (strip(s).match(/class(?:Name)?="[^"]*\bdark:[^"]*"/g) || []).length;
function unlabeledInputs(s) {
  const html = strip(s);
  const labelsFor = new Set([...html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
  let bad = 0;
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)) {
    const attrs = m[2];
    if (/type="(hidden|submit|button|reset)"/.test(attrs)) continue;
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    const ok = /aria-label(ledby)?=/.test(attrs) || (id && labelsFor.has(id));
    // input wrapped in a <label>: look back for an unclosed <label
    const before = html.slice(0, m.index);
    const wrapped = before.lastIndexOf("<label") > before.lastIndexOf("</label>");
    if (!ok && !wrapped) bad++;
  }
  return bad;
}
const has = (s, re) => re.test(s);
const kw = (s, groups) => groups.map(([name, re]) => ({ name, hit: re.test(s) }));

const A = (text, passed, evidence) => ({ text, passed: !!passed, evidence: String(evidence) });

// ---------- browser checks ----------
const LIGHT = [[390, false], [1280, false]];
const LIGHT_DARK = [...LIGHT, [390, true], [1280, true]];
// Renders f once per [width, dark] config, keyed "390 light", "1280 dark"...
const renderAll = (f, configs, steps) => Object.fromEntries(configs.map(([w, d]) => [`${w} ${d ? "dark" : "light"}`, render(f, { width: w, dark: d, steps })]));
// Uncompiled pages score 0; responsive overrides (flex medium:table-row) legitimately lower the ratio.
const compiledOk = (r) => !!r.compiled && r.compiled.flexElements > 0 && r.compiled.flexApplied / r.compiled.flexElements >= 0.5;
const sum = (r) => (r.audit ? r.audit.summary : {});
const failTargets = (r) => (r.audit ? r.audit.targets.filter((t) => t.severity === "fail") : []);
const why = (r) => r.error || r.warning || "";
const first = (items, fmt, n = 3) => items.slice(0, n).map(fmt).join("; ");
// One check per rule; evidence lists the failing configs ("390 dark: ...") or "ok".
const check = (text, runs, pass, evidence) => {
  const bad = Object.entries(runs).filter(([, r]) => !pass(r)).map(([k, r]) => `${k}: ${(r.audit && evidence(r)) || why(r) || "failed"}`);
  return A(text, bad.length === 0, bad.join(" || ") || "ok");
};
function renderChecks(runs) {
  const phones = Object.fromEntries(Object.entries(runs).filter(([k]) => k.startsWith("390")));
  return [
    check("[browser] Styles compile (utilities apply)", runs, compiledOk, (r) => `${r.compiled.flexApplied}/${r.compiled.flexElements} flex`),
    check("[browser] No horizontal scroll at 390px", phones, (r) => sum(r).horizontalOverflow === false, (r) => (r.audit.overflowing || []).join("; ")),
    check(`[browser] Text contrast passes (${Object.keys(runs).join(", ")})`, runs, (r) => sum(r).contrastFailures === 0, (r) => first(r.audit.contrast, (c) => `${c.el} ${c.ratio}:1`)),
    check("[browser] No tap target under 24px", runs, (r) => !!r.audit && failTargets(r).length === 0, (r) => first(failTargets(r), (t) => `${t.el} ${t.width}x${t.height}`)),
    check("[browser] Every control has an accessible name or label", runs, (r) => sum(r).missingNames === 0 && sum(r).missingLabels === 0, (r) => `names=${sum(r).missingNames} labels=${sum(r).missingLabels}`),
  ];
}
const pageChecks = (f, configs = LIGHT) => (f ? renderChecks(renderAll(f, configs)) : [A("[browser] Page renders", false, "no file")]);
// In-page helper: any CSS color -> [r, g, b], or null when fully transparent.
const RGB_JS = `const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    const rgb = (s) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "rgba(0,0,0,0)"; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return d[3] ? [d[0], d[1], d[2]] : null; };`;

// ---------- color math (sRGB 0-255) ----------
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [relLum(a), relLum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const T = (c) => (c ? `T${tone(c).toFixed(0)}` : "?");
// CIELAB L* = HCT tone, the number M3 schemes are specified in.
const tone = (c) => { const y = relLum(c); return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y; };
function oklch([r, g, b]) {
  const [R, G, B] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const A2 = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { c: Math.hypot(A2, B2), h: ((Math.atan2(B2, A2) * 180) / Math.PI + 360) % 360 };
}
const hueDist = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const BRAND = "#0b6e4f";
const ROLES = ["primary", "on-primary", "primary-container", "on-primary-container", "inverse-primary", "secondary", "on-secondary", "secondary-container", "on-secondary-container", "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container", "error", "on-error", "error-container", "on-error-container", "surface", "on-surface", "surface-variant", "on-surface-variant", "surface-dim", "surface-bright", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest", "inverse-surface", "inverse-on-surface", "outline", "outline-variant", "scrim", "shadow"];
const TIERS = ["surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"];
// [fg, bg] text pairs every M3 scheme must meet (the on-color pairs from scripts/contrast-check.mjs).
const PAIRS = [
  ...["primary", "secondary", "tertiary", "error"].flatMap((r) => [[`on-${r}`, r], [`on-${r}-container`, `${r}-container`]]),
  ["inverse-on-surface", "inverse-surface"],
  ...["surface", ...TIERS].flatMap((s) => [["on-surface", s], ["on-surface-variant", s]]),
];
// Tone targets shared by every M3 scheme variant: role -> [light, dark]. Primary is left out on
// purpose: Content and Fidelity keep it near the brand's own tone (#0b6e4f gives T31, not T40).
const TONES = { surface: [98, 6], "on-surface": [10, 90], "surface-container-lowest": [100, 4], "surface-container-low": [96, 10], "surface-container": [94, 12], "surface-container-high": [92, 17], "surface-container-highest": [90, 22] };

// Resolves every role to an sRGB color by rendering a bg-<role> box per role with the user's
// theme (any format: light-dark(), media queries, .dark class, var() chains). Reads the standard
// scheme, then data-contrast="high", then data-theme="dark" forced.
function resolveTheme(out) {
  const css = read(join(out, "theme.css")).replace(/^\s*@import[^;]*;\s*$/gm, "");
  const probe = join(out, ".__probe-theme.html");
  writeFileSync(probe, `<!doctype html><html><head><script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3"></script>
<style type="text/tailwindcss">@import "tailwindcss";\n${css}</style></head><body>
${ROLES.map((r) => `<div data-role="${r}" class="bg-${r} size-4"></div>`).join("")}
</body></html>`);
  const steps = `async (wait) => {
    ${RGB_JS}
    const read = () => Object.fromEntries([...document.querySelectorAll("[data-role]")].map((e) => [e.dataset.role, rgb(getComputedStyle(e).backgroundColor)]));
    const root = document.documentElement, res = { std: read() };
    root.dataset.contrast = "high"; await wait(100); res.high = read(); delete root.dataset.contrast;
    root.dataset.theme = "dark"; root.classList.add("dark"); await wait(100); res.forcedDark = read();
    return res;
  }`;
  try {
    const [light, dark] = [false, true].map((d) => render(probe, { width: 800, dark: d, steps }));
    return { light: light.steps, dark: dark.steps, error: light.error || dark.error };
  } finally { rmSync(probe, { force: true }); }
}

const loadPage = (out, preferred) => { const f = mainFile(out, preferred); return { f, s: read(f), l: lint(f) }; };
const lintOk = (l, text = "Token lint has 0 errors") => A(text, countErrors(l) === 0, `errors=${countErrors(l)}`);
const darkOk = (s, text = "No component-level dark: classes") => A(text, darkClasses(s) === 0, `dark class attrs=${darkClasses(s)}`);

const CHECKS = {
  "build-signup-page": (out) => {
    const { f, s, l } = loadPage(out, "index.html");
    const autocomplete = (s.match(/autocomplete="/g) || []).length;
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      lintOk(l, "Token lint has 0 errors (no raw colors / default palette)"),
      A("Uses M3 color-role classes (>=10 uses)", m3Roles(s) >= 10, `role uses=${m3Roles(s)}`),
      A("Every input/select has a programmatic label", unlabeledInputs(s) === 0, `unlabeled=${unlabeledInputs(s)}`),
      A("Errors wired to fields (aria-invalid or aria-describedby)", has(s, /aria-invalid|aria-describedby/), ""),
      A("autocomplete attributes on name/email/password", autocomplete >= 3, autocomplete),
      darkOk(s),
      A("Visible focus styles (focus-visible)", has(s, /focus-visible|:focus-visible/), ""),
      ...pageChecks(f),
    ];
  },
  "build-store-dashboard": (out) => {
    const { f, s, l } = loadPage(out, "index.html");
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      lintOk(l),
      A("Uses M3 color-role classes (>=15 uses)", m3Roles(s) >= 15, `role uses=${m3Roles(s)}`),
      A("Uses tonal surface-container tiers", has(s, /surface-container/), ""),
      A("Navigation adapts by width (nav + breakpoint variants hiding/showing it)", has(s, /<nav/) && has(s, /(medium|expanded|md|lg|sm):(hidden|flex|block)/), ""),
      A("Recent orders is a real <table> with header cells", has(s, /<table/) && has(s, /<th\b/), ""),
      A("Loading, empty or error state present", has(s, /skeleton|loading|aria-busy|empty|no orders|error/i), ""),
      darkOk(s),
      ...pageChecks(f),
    ];
  },
  "build-settings-page": (out) => {
    const { f, s, l } = loadPage(out, "index.html");
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      lintOk(l),
      A("Theme switch handles System via matchMedia", has(s, /matchMedia\(\s*['"]\(prefers-color-scheme/), ""),
      darkOk(s, "Theme applied through a root attribute/class, not per-component dark: classes"),
      A("Switches exposed as switches (role=switch or checkbox input)", has(s, /role="switch"|type="checkbox"/), ""),
      A("Delete confirmation uses a modal dialog (<dialog> + showModal)", has(s, /<dialog/) && has(s, /showModal\(/), ""),
      A("Every input has a programmatic label", unlabeledInputs(s) === 0, `unlabeled=${unlabeledInputs(s)}`),
      A("Theme choice persisted (localStorage)", has(s, /localStorage/), ""),
      ...pageChecks(f, [...LIGHT, [1280, true]]),
    ];
  },
  "review-login-page": (out) => {
    const s = read(join(out, "response.md"));
    const hits = kw(s, [
      ["placeholder used as label", /placeholder[^.\n]{0,60}label|label[^.\n]{0,60}placeholder/i],
      ["low-contrast gray text", /contrast/i],
      ["forgot-password span not a link / not keyboard", /forgot[\s\S]{0,300}(span|keyboard|<a\b|anchor|link)/i],
      ["disabled submit button", /disabled/i],
      ["two equal primary buttons / sign up competes", /sign.?up[\s\S]{0,300}(compet|primary|emphasis|equal|same)/i],
      ["vague 'Invalid input' error", /invalid input/i],
      ["missing alt on logo", /\balt\b/i],
      ["not a <form> / Enter submit", /<form|form element|enter key|submit on enter/i],
      ["outline-none / focus visibility", /outline-none|focus/i],
      ["heading is a div (no h1)", /<h1|heading/i],
    ]);
    const sev = /critical|high|major/i.test(s) && /low|minor/i.test(s);
    const fences = (s.match(/```/g) || []).length;
    return [
      A("Saved the review as response.md", s.length > 200, `${s.length} chars`),
      A("Findings labelled and ordered by severity", sev, ""),
      A("Each finding includes a fix code snippet (>=4 code blocks)", fences >= 8, `${fences / 2} blocks`),
      A("Covers >=8 of 10 planted problems", hits.filter((h) => h.hit).length >= 8, hits.map((h) => `${h.hit ? "+" : "-"}${h.name}`).join("; ")),
    ];
  },
  "audit-product-grid": (out) => {
    const s = read(join(out, "response.md"));
    const hits = kw(s, [
      ["no loading/empty/error states", /loading/i],
      ["fetch error not handled", /error/i],
      ["clickable div not keyboard", /onClick[\s\S]{0,200}(div|keyboard)|clickable (div|card)|div[\s\S]{0,80}keyboard/i],
      ["img missing alt", /\balt\b/i],
      ["stars have no text alternative", /star|rating/i],
      ["competing CTAs (Add to cart vs Buy now)", /buy now/i],
      ["heart icon button no label / small target", /♡|heart|favou?rite|wishlist/i],
      ["fixed 4-col grid not responsive", /grid-cols-4|responsive|breakpoint/i],
      ["raw colors / arbitrary values → tokens", /#222|#888|arbitrary|raw/i],
      ["10px text / low contrast", /10px|text-\[10px\]|contrast/i],
      ["price formatting", /Intl\.NumberFormat|toFixed|currency format|format(ted|ting)? (the )?price/i],
      ["stock conveyed by color only", /color alone|colou?r only|only (by )?colou?r/i],
    ]);
    const sev = /critical|high|major/i.test(s) && /low|minor/i.test(s);
    return [
      A("Saved the audit as response.md", s.length > 200, `${s.length} chars`),
      A("Findings labelled and ordered by severity", sev, ""),
      A("Gives concrete M3/Tailwind v4 replacement classes", /bg-surface|on-surface|surface-container|text-(body|title|label)-/i.test(s), ""),
      A("Covers >=9 of 12 planted problems", hits.filter((h) => h.hit).length >= 9, hits.map((h) => `${h.hit ? "+" : "-"}${h.name}`).join("; ")),
    ];
  },
  "fix-delete-dialog": (out) => {
    const { f, s, l } = loadPage(out, "delete-dialog.fixed.html");
    const btns = [...strip(s).matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
    return [
      A("Saved delete-dialog.fixed.html", !!f && f.endsWith("delete-dialog.fixed.html"), f || "none"),
      A("Uses native <dialog> with showModal()", has(s, /<dialog/) && has(s, /showModal\(/), ""),
      A("No YES/NO labels; confirm button says Delete", !btns.some((b) => /^(yes|no)$/i.test(b)) && btns.some((b) => /delete/i.test(b)), btns.join(" | ")),
      A("Actions end-aligned", has(s, /justify-end/), ""),
      A("Dialog not fixed at 640px (max-w / min(...) <= 560)", !has(s, /w-\[640px\]/), ""),
      A("Labelled dialog (aria-labelledby or headline in <h2>)", has(s, /aria-labelledby|<h2/), ""),
      lintOk(l),
      A("Response lists changes", read(join(out, "response.md")).length > 100, ""),
    ];
  },
  "expressive-onboarding": (out) => {
    const { f, s, l } = loadPage(out, "index.html");
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      A("Honors prefers-reduced-motion", has(s, /prefers-reduced-motion|motion-reduce|motion-safe/), ""),
      A("Spring/overshoot motion (cubic-bezier with y>1 or linear())", has(s, /cubic-bezier\([^)]*,\s*1\.[0-9]+|linear\(/), ""),
      A("Built on M3 role tokens (>=10 uses)", m3Roles(s) >= 10, `role uses=${m3Roles(s)}`),
      lintOk(l),
      A("Choices are accessible selections (radio / aria-checked / aria-pressed)", has(s, /type="radio"|aria-checked|aria-pressed|role="radio"/), ""),
      A("Step progress communicated (aria-current / progressbar / 'Step x of 3')", has(s, /aria-current|progressbar|step \d of 3|aria-valuenow/i), ""),
      ...pageChecks(f),
    ];
  },
  // ---------- hard tasks: graded mostly in a real browser ----------
  "fix-silent-bugs": (out) => {
    const f = mainFile(out, "plan-picker.fixed.html"); const s = read(f); const resp = read(join(out, "response.md"));
    const steps = `async (wait) => {
      const shown = () => [...document.querySelectorAll(".material-symbols-outlined, .material-symbols-rounded, .material-icons")].filter((e) => /check/.test(e.textContent))
        .map((e) => { const r = e.getBoundingClientRect(), st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && +st.opacity > 0 ? 1 : 0; }).join("");
      const radios = [...document.querySelectorAll('input[type="radio"]')];
      const initial = shown();
      if (radios[2]) { radios[2].click(); await wait(300); }
      return { initial, afterThird: shown(), radios: radios.length };
    }`;
    const r = f ? render(f, { steps }) : { error: "no file" };
    const st = r.steps || {};
    return [
      A("Saved plan-picker.fixed.html", !!f && f.endsWith("plan-picker.fixed.html"), f || "none"),
      A("[browser] Tailwind utilities apply (page is styled)", compiledOk(r) && !/rgba\(0, 0, 0, 0\)/.test(r.compiled.bodyBg), r.error || JSON.stringify(r.compiled)),
      A("[browser] Only the selected plan shows the check mark", st.initial === "010", r.error || `visible marks=${st.initial}`),
      A("[browser] Choosing another plan moves the check mark", st.afterThird === "001", r.error || `after selecting Grove=${st.afterThird}`),
      A("Plans stay native radio inputs", st.radios === 3, `radios=${st.radios}`),
      A("Design kept (brand token and all plans/prices)", has(s, /--color-brand:\s*#0b6e4f/i) && ["Seed", "Sprout", "Grove", "Free", "$4/mo", "$9/mo"].every((t) => s.includes(t)), ""),
      A("Explains cause 1: @import text disables the browser build's automatic Tailwind import", /@import/.test(resp) && /comment|automatic|auto-?inject|injects?|adds? .{0,20}import/i.test(resp), ""),
      A("Explains cause 2: the icon font's unlayered display rule beats Tailwind's layered hidden", /unlayered|cascade layer|@layer|layer/i.test(resp) && /inline-block|display/i.test(resp), ""),
    ];
  },
  "brand-theme": (out) => {
    const css = read(join(out, "theme.css"));
    if (!css) return [A("Saved theme.css", false, "none")];
    const t = resolveTheme(out);
    const L = t.light || {}, D = t.dark || {};
    const Ls = L.std || {}, Ds = D.std || {};
    const brand = oklch(hexRgb(BRAND));
    // Each helper returns the failures as strings; [] means pass.
    const missing = (m) => ROLES.filter((r) => !m[r]);
    const pairFails = (m, min) => PAIRS.map(([fg, bg]) => [fg, bg, m[fg] && m[bg] && contrast(m[fg], m[bg])])
      .filter(([, , r]) => !r || r < min).map(([fg, bg, r]) => `${fg}/${bg} ${r ? r.toFixed(2) : "?"}`);
    const toneOff = (m, i) => Object.entries(TONES).filter(([r, v]) => !m[r] || Math.abs(tone(m[r]) - v[i]) > 3).map(([r, v]) => `${r} ${T(m[r])} (want ${v[i]})`);
    // Runs fn(scheme, 0 = light | 1 = dark) on both themes and labels the failures.
    const both = (fn, light = Ls, dark = Ds) => [...fn(light, 0).map((x) => "light " + x), ...fn(dark || {}, 1).map((x) => "dark " + x)];
    const tiersOrdered = (m, dir) => TIERS.slice(1).every((r, i) => m[r] && m[TIERS[i]] && dir * (tone(m[TIERS[i]]) - tone(m[r])) > 0);
    const changed = (a = {}, b = {}) => ROLES.some((r) => a[r] && b[r] && a[r].join() !== b[r].join());
    const hue = (m) => m.primary && oklch(m.primary);
    const hueOk = (m) => { const h = hue(m); return !!h && hueDist(h.h, brand.h) <= 20 && h.c >= 0.03; };
    const failsStd = both((m) => pairFails(m, 4.5));
    const failsHigh = both((m) => pairFails(m, 7), L.high || {}, D.high);
    const highWorks = changed(Ls, L.high) && changed(Ds, D.high);
    const toneFails = both(toneOff);
    return [
      A("Saved theme.css", true, `${css.length} chars`),
      A("[browser] All M3 roles resolve in light and dark (incl. surface-container tiers)", !t.error && both(missing).length === 0, t.error || `missing: ${both(missing).join(", ") || "none"}`),
      A("[browser] Follows the system theme (light surface, dark surface)", Ls.surface && Ds.surface && tone(Ls.surface) > 90 && tone(Ds.surface) < 15, `surface ${T(Ls.surface)} / ${T(Ds.surface)}`),
      A("[browser] data-theme=\"dark\" forces dark under a light system", L.forcedDark?.surface && tone(L.forcedDark.surface) < 15, T(L.forcedDark?.surface)),
      A("[browser] Every on-color pair meets 4.5:1 (light and dark)", failsStd.length === 0, first(failsStd, String, 6) || "ok"),
      A("[browser] data-contrast=\"high\" changes the scheme and pairs meet 7:1", highWorks && failsHigh.length === 0, highWorks ? first(failsHigh, String, 6) || "ok" : "high contrast has no effect"),
      A("[browser] Primary keeps the brand hue (within 20° OKLCH) in both themes", hueOk(Ls) && hueOk(Ds), [Ls, Ds].map((m) => (hue(m) ? `h${hue(m).h.toFixed(0)} c${hue(m).c.toFixed(3)}` : "?")).join(" / ") + ` (brand h${brand.h.toFixed(0)})`),
      A("[browser] Surface tones match the M3 scheme (T98/T6, container tiers)", toneFails.length === 0, first(toneFails, String, 6) || "ok"),
      A("[browser] Surface-container tiers step in order", tiersOrdered(Ls, 1) && tiersOrdered(Ds, -1), TIERS.map((r) => `${T(Ls[r])}/${T(Ds[r])}`).join(" ")),
    ];
  },
  "migrate-dashboard": (out) => {
    const f = mainFile(out, "dashboard.m3.html");
    if (!f) return [A("Saved dashboard.m3.html", false, "none")];
    const l = lint(f);
    const steps = `async () => {
      ${RGB_JS}
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; };
      const name = (e) => (e.getAttribute("aria-label") || e.textContent || "").trim();
      const btns = [...document.querySelectorAll("button, a[href], [role=button]")].filter(vis).map(name);
      const navs = [...document.querySelectorAll("nav")].filter(vis).map((n) => [...n.querySelectorAll("a, button")].filter(vis).length);
      return { edit: btns.filter((n) => /edit/i.test(n)).length, del: btns.filter((n) => /delete|remove/i.test(n)).length, navItems: Math.max(0, ...navs), body: rgb(getComputedStyle(document.body).backgroundColor) };
    }`;
    const runs = renderAll(f, LIGHT_DARK, steps);
    const st = (k) => runs[k].steps || {};
    const DATA = ["$48,290", "1,284", "892", "12.4%", "4.1%", "1.8%", "9.0%", "#1042", "#1041", "#1040", "Maya Chen", "Tom Becker", "Aisha Khan", "$128.00", "$54.50", "$310.00", "Home", "Reports", "Orders", "Customers", "Settings", "Export", "paid", "pending", "refunded"];
    const text = (runs["1280 light"].text || "").toLowerCase();
    const lost = DATA.filter((d) => !text.includes(d.toLowerCase()));
    // A transparent body (no styles) reads as null, so it can't pass as "dark".
    const bodyTone = (k) => (st(k).body ? tone(st(k).body) : NaN);
    return [
      A("Saved dashboard.m3.html", true, f),
      lintOk(l),
      ...renderChecks(runs),
      A("[browser] Dark mode follows the system", bodyTone("390 dark") < 20 && bodyTone("1280 dark") < 20 && bodyTone("1280 light") > 85, Object.keys(runs).map((k) => `${k}: ${T(st(k).body)}`).join("; ")),
      check("[browser] Keyboard focus is visible on every control", runs, (r) => sum(r).noVisibleFocus === 0, (r) => `${sum(r).noVisibleFocus} without focus style`),
      A("[browser] Navigation visible on phone and desktop (>=4 items)", st("390 light").navItems >= 4 && st("1280 light").navItems >= 4, `390: ${st("390 light").navItems}; 1280: ${st("1280 light").navItems}`),
      A("[browser] Each order has named Edit and Delete buttons", st("1280 light").edit >= 3 && st("1280 light").del >= 3, `edit=${st("1280 light").edit} delete=${st("1280 light").del}`),
      A("[browser] No data or action lost", lost.length === 0, lost.length ? `missing: ${lost.join(", ")}` : "all present"),
    ];
  },
  "existing-design-system": (out) => {
    const f = mainFile(out, "index.updated.html"); const s = read(f);
    const orig = read(join(WS, "inputs/acme-admin/index.html"));
    const added = s.length - orig.length;
    return [
      A("Saved index.updated.html", !!f && f.endsWith("index.updated.html"), f || "none"),
      A("Uses Acme classes (acme-card, acme-btn-*)", has(s, /acme-card/) && has(s, /acme-btn-(primary|ghost)/), ""),
      A("Introduces no M3 tokens", m3Roles(s) - m3Roles(orig) <= 0 && !has(s, /surface-container|text-(body|title|label|headline)-(small|medium|large)/), `added role uses=${m3Roles(s) - m3Roles(orig)}`),
      A("No new raw colors / default palette", !/(bg|text|border)-(gray|slate|red|blue|green|zinc|neutral)-\d{2,3}|\[#/.test(s.replace(orig, "")), ""),
      A("Role selector is labelled", unlabeledInputs(s) <= unlabeledInputs(orig), `unlabeled now=${unlabeledInputs(s)} before=${unlabeledInputs(orig)}`),
      A("Remove is confirmed or undoable", has(s, /confirm|<dialog|undo/i), ""),
      A("Remove buttons name the member (aria-label with name)", has(s, /aria-label="Remove [A-Z]/), ""),
      A("Added a meaningful amount of markup", added > 800, `+${added} chars`),
    ];
  },
};

// inputs untouched?
const sums = read(join(WS, "inputs.sha256")).trim().split(/\r?\n/).filter(Boolean);
let inputsOk = true;
for (const line of sums) {
  const [hash, ...rest] = line.trim().split(/\s+/); const p = rest.join(" ").replace(/^\*/, "");
  const fp = join(WS, p.replace(/^.*?inputs\//, "inputs/"));
  if (existsSync(fp) && createHash("sha256").update(readFileSync(fp)).digest("hex") !== hash) { inputsOk = false; console.log("MODIFIED INPUT:", fp); }
}
console.log("inputs unchanged:", inputsOk);

const only = process.argv.slice(3);
for (const ev of readdirSync(IT).filter((d) => CHECKS[d] && (!only.length || only.includes(d)))) {
  for (const cfg of ["with_skill", "without_skill"]) {
    const out = join(IT, ev, cfg, "outputs");
    if (!existsSync(out) || readdirSync(out).length === 0) { console.log([ev, cfg, "NO OUTPUT"].join("  |  ")); continue; }
    const exps = CHECKS[ev](out);
    const passed = exps.filter((e) => e.passed).length;
    writeFileSync(join(IT, ev, cfg, "grading.json"), JSON.stringify({ expectations: exps, summary: { passed, failed: exps.length - passed, total: exps.length, pass_rate: +(passed / exps.length).toFixed(2) } }, null, 2));
    const failed = exps.filter((e) => !e.passed).map((e) => e.text + (e.evidence ? ` [${e.evidence}]` : "")).join(" || ");
    console.log([ev, cfg, `${passed}/${exps.length}`, failed].join("  |  "));
  }
}
