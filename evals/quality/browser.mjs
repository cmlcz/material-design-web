// browser.mjs: render an output page in headless Chrome and return measurements.
// No dependencies: injects scripts/audit-page.js plus a few extra probes into a
// temporary copy of the page, runs `chrome --headless --dump-dom`, and reads the
// JSON the page writes back. Set CHROME=<path> if Chrome is not found.
import { readFileSync, writeFileSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const AUDIT = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../scripts/audit-page.js"), "utf8");

const CANDIDATES = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
export const CHROME = CANDIDATES.find((p) => existsSync(p));

// Runs in the page after load: optional `steps` (async fn source), then audit + probes.
const probe = (steps) => `<script>
addEventListener("load", () => setTimeout(async () => {
  const out = {};
  try {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    // "load" already waited for stylesheets; a sheet without .sheet now has failed.
    out.cssMissing = [...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !l.sheet).map((l) => l.href);
    // The Tailwind browser build always injects a <style> with its banner, even when it generates
    // nothing; no banner means its CDN script never ran.
    const tw = document.querySelector('script[src*="@tailwindcss/browser"]');
    if (tw && ![...document.querySelectorAll("style")].some((s) => s.textContent.startsWith("/*! tailwindcss"))) out.cssMissing.push(tw.src);
    // Until an icon font arrives, a ligature name ("local_fire_department") renders as wide text
    // and can overflow, so load every family in use first. The load promises settle on the real
    // download; the poll covers the rest (timers run on virtual time, so no timeout race).
    const families = [...new Set([...document.querySelectorAll("body, body *")].map((e) => getComputedStyle(e).fontFamily))];
    await Promise.all(families.map((f) => document.fonts.load("24px " + f).catch(() => {})));
    const pending = () => families.filter((f) => { try { return !document.fonts.check("24px " + f); } catch { return false; } });
    for (let i = 0; i < 100 && pending().length; i++) await wait(100);
    out.fontsMissing = pending();
    await wait(200);
    ${steps ? `out.steps = await (${steps})(wait);` : ""}
    await wait(300);
    out.audit = (${AUDIT})();
    if (out.audit.summary.horizontalOverflow) {
      const past = (e) => e.getBoundingClientRect().right > innerWidth + 1;
      out.audit.overflowing = [...document.querySelectorAll("body *")]
        .filter((e) => past(e) && ![...e.children].some(past))
        .slice(0, 3).map((e) => e.tagName.toLowerCase() + "." + (e.getAttribute("class") || "").trim().split(/\\s+/).slice(0, 4).join(".") + " right=" + Math.round(e.getBoundingClientRect().right));
    }
    // Elements hidden on purpose (hidden medium:flex) only show display:none when utilities compiled.
    const flexy = [...document.querySelectorAll('[class~="flex"]')].filter((e) => getComputedStyle(e).display !== "none");
    out.compiled = {
      bodyBg: getComputedStyle(document.body).backgroundColor,
      flexElements: flexy.length,
      flexApplied: flexy.filter((e) => getComputedStyle(e).display.includes("flex")).length,
    };
    out.text = document.body.innerText;
  } catch (e) { out.error = String(e && e.stack || e); }
  parent.postMessage({ __grade: JSON.stringify(out) }, "*");
}, 2000));
</script>`;

// Headless Chrome won't size a window below ~500px, so the page runs in an
// iframe of the exact viewport and posts its result to this wrapper.
const wrapper = (src, w, h) => `<!doctype html><body style="margin:0">
<iframe src="${src}" style="border:0;display:block;width:${w}px;height:${h}px"></iframe>
<script>addEventListener("message", (e) => {
  if (!e.data || !e.data.__grade) return;
  const s = document.createElement("script");
  s.type = "application/json"; s.id = "__grade";
  s.textContent = e.data.__grade.replace(/</g, "\\\\u003c");
  document.body.append(s);
});</script></body>`;

/**
 * @param {string} file  HTML file to render (relative assets resolve from its folder)
 * @param {{width?:number,height?:number,dark?:boolean,steps?:string}} opts
 *   steps: source of an async function `(wait) => result` run before measuring.
 */
export function render(file, opts = {}) {
  if (!CHROME) return { error: "Chrome not found (set CHROME=<path>)" };
  // Only a stylesheet, script or font that didn't arrive (flaky CDN) is worth retrying; other errors repeat.
  const missing = (x) => [...(x.cssMissing || []), ...(x.fontsMissing || [])];
  let r;
  for (let i = 0; i < 4; i++) {
    if (i) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500 * i); // back off: font CDN failures come in bursts
    r = renderOnce(file, opts);
    if (r.error || missing(r).length === 0) return r;
  }
  // Keep the measurement but say why it may be off (fallback-font widths), so a rare CDN outage reads as such.
  return { ...r, warning: `never loaded: ${missing(r).join(", ")}` };
}

function renderOnce(file, { width = 1280, height = 800, dark, steps }) {
  const tmp = join(dirname(file), `.__grade-${process.pid}-${basename(file)}`);
  const wrap = tmp.replace(/\.html?$/i, "") + ".wrap.html";
  // The parser moves a script after </html> into <body>, so appending is enough.
  writeFileSync(tmp, readFileSync(file, "utf8") + probe(steps));
  writeFileSync(wrap, wrapper(basename(tmp), width, height));
  const profile = mkdtempSync(join(tmpdir(), "grade-chrome-"));
  try {
    const args = [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
      `--user-data-dir=${profile}`, `--window-size=${Math.max(width, 800)},${height + 100}`,
      "--virtual-time-budget=15000", "--dump-dom",
      "--allow-file-access-from-files",
      // prefers-color-scheme for pages that follow the system: 0 = dark, 1 = light (else the OS setting leaks in)
      `--blink-settings=preferredColorScheme=${dark ? 0 : 1}`,
    ];
    const dom = execFileSync(CHROME, [...args, pathToFileURL(wrap).href], { encoding: "utf8", timeout: 90000, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 });
    const m = dom.match(/<script type="application\/json" id="__grade">([\s\S]*?)<\/script>/);
    return m ? JSON.parse(m[1]) : { error: "page wrote no result (script error or timeout)" };
  } catch (e) {
    return { error: String(e.message || e).slice(0, 300) };
  } finally {
    rmSync(tmp, { force: true });
    rmSync(wrap, { force: true });
    rmSync(profile, { recursive: true, force: true });
  }
}

// CLI: node browser.mjs <file> [width] [dark]
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [file, width, dark] = process.argv.slice(2);
  const r = render(file, { width: +width || 1280, dark: dark === "dark" });
  if (r.audit) {
    const { viewport, theme, summary, contrast, targets, overflowing } = r.audit;
    r.audit = { viewport, theme, summary, contrast: contrast.slice(0, 5), targets: targets.slice(0, 5), overflowing };
    delete r.text;
  }
  console.log(JSON.stringify(r, null, 2));
}
