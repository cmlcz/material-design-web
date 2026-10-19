// grade.mjs: scripted assertions for material-design-web iteration-1.
// Usage: node grade.mjs [iteration-dir]   -> writes grading.json per run + prints a table.
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

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

const CHECKS = {
  "build-signup-page": (out) => {
    const f = mainFile(out, "index.html"); const s = read(f); const l = lint(f);
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      A("Token lint has 0 errors (no raw colors / default palette)", countErrors(l) === 0, `errors=${countErrors(l)}`),
      A("Uses M3 color-role classes (>=10 uses)", m3Roles(s) >= 10, `role uses=${m3Roles(s)}`),
      A("Every input/select has a programmatic label", unlabeledInputs(s) === 0, `unlabeled=${unlabeledInputs(s)}`),
      A("Errors wired to fields (aria-invalid or aria-describedby)", has(s, /aria-invalid|aria-describedby/), ""),
      A("autocomplete attributes on name/email/password", (s.match(/autocomplete="/g) || []).length >= 3, (s.match(/autocomplete="/g) || []).length),
      A("No component-level dark: classes", darkClasses(s) === 0, `dark class attrs=${darkClasses(s)}`),
      A("Visible focus styles (focus-visible)", has(s, /focus-visible|:focus-visible/), ""),
    ];
  },
  "build-store-dashboard": (out) => {
    const f = mainFile(out, "index.html"); const s = read(f); const l = lint(f);
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      A("Token lint has 0 errors", countErrors(l) === 0, `errors=${countErrors(l)}`),
      A("Uses M3 color-role classes (>=15 uses)", m3Roles(s) >= 15, `role uses=${m3Roles(s)}`),
      A("Uses tonal surface-container tiers", has(s, /surface-container/), ""),
      A("Navigation adapts by width (nav + breakpoint variants hiding/showing it)", has(s, /<nav/) && has(s, /(medium|expanded|md|lg|sm):(hidden|flex|block)/), ""),
      A("Recent orders is a real <table> with header cells", has(s, /<table/) && has(s, /<th\b/), ""),
      A("Loading, empty or error state present", has(s, /skeleton|loading|aria-busy|empty|no orders|error/i), ""),
      A("No component-level dark: classes", darkClasses(s) === 0, `dark class attrs=${darkClasses(s)}`),
    ];
  },
  "build-settings-page": (out) => {
    const f = mainFile(out, "index.html"); const s = read(f); const l = lint(f);
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      A("Token lint has 0 errors", countErrors(l) === 0, `errors=${countErrors(l)}`),
      A("Theme switch handles System via matchMedia", has(s, /matchMedia\(\s*['"]\(prefers-color-scheme/), ""),
      A("Theme applied through a root attribute/class, not per-component dark: classes", darkClasses(s) === 0, `dark class attrs=${darkClasses(s)}`),
      A("Switches exposed as switches (role=switch or checkbox input)", has(s, /role="switch"|type="checkbox"/), ""),
      A("Delete confirmation uses a modal dialog (<dialog> + showModal)", has(s, /<dialog/) && has(s, /showModal\(/), ""),
      A("Every input has a programmatic label", unlabeledInputs(s) === 0, `unlabeled=${unlabeledInputs(s)}`),
      A("Theme choice persisted (localStorage)", has(s, /localStorage/), ""),
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
    return [
      A("Saved the review as response.md", s.length > 200, `${s.length} chars`),
      A("Findings labelled and ordered by severity", sev, ""),
      A("Each finding includes a fix code snippet (>=4 code blocks)", (s.match(/```/g) || []).length >= 8, `${(s.match(/```/g) || []).length / 2} blocks`),
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
    const f = mainFile(out, "delete-dialog.fixed.html"); const s = read(f); const l = lint(f);
    const btns = [...strip(s).matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
    return [
      A("Saved delete-dialog.fixed.html", !!f && f.endsWith("delete-dialog.fixed.html"), f || "none"),
      A("Uses native <dialog> with showModal()", has(s, /<dialog/) && has(s, /showModal\(/), ""),
      A("No YES/NO labels; confirm button says Delete", !btns.some((b) => /^(yes|no)$/i.test(b)) && btns.some((b) => /delete/i.test(b)), btns.join(" | ")),
      A("Actions end-aligned", has(s, /justify-end/), ""),
      A("Dialog not fixed at 640px (max-w / min(...) <= 560)", !has(s, /w-\[640px\]/), ""),
      A("Labelled dialog (aria-labelledby or headline in <h2>)", has(s, /aria-labelledby|<h2/), ""),
      A("Token lint has 0 errors", countErrors(l) === 0, `errors=${countErrors(l)}`),
      A("Response lists changes", read(join(out, "response.md")).length > 100, ""),
    ];
  },
  "expressive-onboarding": (out) => {
    const f = mainFile(out, "index.html"); const s = read(f); const l = lint(f);
    return [
      A("Produces a single HTML file", !!f, f || "none"),
      A("Honors prefers-reduced-motion", has(s, /prefers-reduced-motion|motion-reduce|motion-safe/), ""),
      A("Spring/overshoot motion (cubic-bezier with y>1 or linear())", has(s, /cubic-bezier\([^)]*,\s*1\.[0-9]+|linear\(/), ""),
      A("Built on M3 role tokens (>=10 uses)", m3Roles(s) >= 10, `role uses=${m3Roles(s)}`),
      A("Token lint has 0 errors", countErrors(l) === 0, `errors=${countErrors(l)}`),
      A("Choices are accessible selections (radio / aria-checked / aria-pressed)", has(s, /type="radio"|aria-checked|aria-pressed|role="radio"/), ""),
      A("Step progress communicated (aria-current / progressbar / 'Step x of 3')", has(s, /aria-current|progressbar|step \d of 3|aria-valuenow/i), ""),
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

const rows = [];
for (const ev of readdirSync(IT).filter((d) => CHECKS[d])) {
  for (const cfg of ["with_skill", "without_skill"]) {
    const out = join(IT, ev, cfg, "outputs");
    if (!existsSync(out) || readdirSync(out).length === 0) { rows.push([ev, cfg, "NO OUTPUT"]); continue; }
    const exps = CHECKS[ev](out);
    const passed = exps.filter((e) => e.passed).length;
    writeFileSync(join(IT, ev, cfg, "grading.json"), JSON.stringify({ expectations: exps, summary: { passed, failed: exps.length - passed, total: exps.length, pass_rate: +(passed / exps.length).toFixed(2) } }, null, 2));
    rows.push([ev, cfg, `${passed}/${exps.length}`, exps.filter((e) => !e.passed).map((e) => e.text + (e.evidence ? ` [${e.evidence}]` : "")).join(" || ")]);
  }
}
for (const r of rows) console.log(r.join("  |  "));
