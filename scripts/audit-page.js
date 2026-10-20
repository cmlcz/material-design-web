// audit-page.js: in-browser audit for contrast, touch targets, names, labels, focus.
// Paste the whole file as the expression/function body of your browser tool's
// "evaluate JS" call. It is one arrow function that returns a JSON-safe object.
//   Function-style tools (Playwright browser_evaluate, Chrome DevTools evaluate_script): pass as-is.
//   Expression-style tools (agent_browser_eval, console): wrap it as (<file contents>)()
// Results are leads to verify, not verdicts.
() => {
  const MAX = 40; // max items per category
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = 1;
  const ctx = cvs.getContext("2d", { willReadFrequently: true });

  // Any CSS color string -> [r,g,b,a] in sRGB 0-255 / 0-1 (handles oklab, color-mix, light-dark results).
  const toRgba = (str) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = str;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const blend = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const c = (i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a;
    return [c(0), c(1), c(2), a];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // sr-only (1x1px, clipped): read by screen readers, never seen or tapped. Kept out of visible()
  // because skip links show on focus and must stay in the focus check.
  const srOnly = (el) => { const r = el.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; };
  const describe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    const cls = (el.getAttribute("class") || "").trim().split(/\s+/).slice(0, 4).join(".");
    if (cls) s += "." + cls;
    const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 40);
    return text ? `${s} "${text}"` : s;
  };

  // Effective background: walk up, blending translucent layers; stop at images/gradients.
  const background = (el) => {
    let color = [0, 0, 0, 0];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      const bg = toRgba(s.backgroundColor);
      if (bg[3] > 0) color = blend(color, bg);
      if (color[3] >= 0.999) return color;
    }
    return blend(color, toRgba(getComputedStyle(document.documentElement).backgroundColor || "#fff")).map((v, i) => (i === 3 ? 1 : v));
  };

  // 1. Contrast: elements that own visible text.
  const contrast = [];
  const unknown = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode;
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || seen.has(el) || !visible(el) || srOnly(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    if (el.closest("[aria-hidden=true]") && !el.closest("button,a")) continue;
    const disabled = el.closest(":disabled,[aria-disabled=true]");
    const bg = background(el);
    if (!bg) { if (unknown.length < MAX) unknown.push(describe(el)); continue; }
    const fg = blend(toRgba(s.color), bg);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    const r = ratio(fg, bg);
    if (r < need && !disabled && contrast.length < MAX) {
      contrast.push({ el: describe(el), ratio: +r.toFixed(2), need, fg: hex(fg), bg: hex(bg), fontSize: size });
    }
  }

  // 2. Touch targets, names, labels.
  const INTERACTIVE = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=radio],[role=switch],[role=option],[tabindex]:not([tabindex="-1"])';
  const targets = [];
  const names = [];
  const labels = [];
  const els = [...document.querySelectorAll(INTERACTIVE)];
  const isFieldTag = (el) => ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName);
  const nameOf = (el) => {
    const byId = (ids) => ids.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ");
    return (
      el.getAttribute("aria-label") ||
      (el.getAttribute("aria-labelledby") && byId(el.getAttribute("aria-labelledby"))) ||
      (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent) ||
      el.closest("label")?.textContent ||
      (isFieldTag(el) ? "" : el.textContent) ||
      el.getAttribute("title") ||
      el.querySelector("img[alt]")?.getAttribute("alt") ||
      (el.type === "submit" || el.type === "button" ? el.value : "") ||
      ""
    ).trim();
  };
  for (const el of els) {
    const label = el.closest("label");
    const box = (label && visible(label) ? label : el);
    if (!visible(box) || srOnly(box)) continue;
    // Inline text links are exempt from target size (WCAG 2.5.8 inline exception).
    const s = getComputedStyle(el);
    const inlineLink = el.tagName === "A" && s.display === "inline" && el.parentElement && /^(P|LI|SPAN|TD|DD)$/.test(el.parentElement.tagName);
    const r = box.getBoundingClientRect();
    let w = r.width, h = r.height;
    for (const pseudo of ["::before", "::after"]) {
      const ps = getComputedStyle(box, pseudo);
      if (ps.content !== "none" && ps.position === "absolute") {
        w = Math.max(w, parseFloat(ps.width) || 0);
        h = Math.max(h, parseFloat(ps.height) || 0);
      }
    }
    if (!inlineLink && (w < 48 || h < 48) && targets.length < MAX) {
      targets.push({ el: describe(el), width: Math.round(w), height: Math.round(h), severity: w < 24 || h < 24 ? "fail" : "below-48" });
    }
    const isField = isFieldTag(el) && !["submit", "button", "reset", "image"].includes(el.type);
    const name = nameOf(el);
    if (isField && !name && labels.length < MAX) {
      labels.push({ el: describe(el), placeholderOnly: !!el.getAttribute("placeholder") });
    } else if (!isField && !name && names.length < MAX) {
      names.push(describe(el));
    }
  }

  // 3. Focus visibility heuristic: does focusing change outline / box-shadow / ::before opacity?
  const focus = [];
  const prev = document.activeElement;
  const snapshot = (el) => {
    const s = getComputedStyle(el);
    const b = getComputedStyle(el, "::before");
    return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, s.backgroundColor, b.opacity].join("|");
  };
  for (const el of els.slice(0, 80)) {
    if (!visible(el) || el.disabled) continue;
    const before = snapshot(el);
    el.focus({ preventScroll: true });
    if (document.activeElement !== el) continue;
    const after = snapshot(el);
    el.blur();
    if (before === after && focus.length < MAX) focus.push(describe(el));
  }
  if (prev && prev.focus) prev.focus({ preventScroll: true });

  const overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;

  return {
    viewport: `${innerWidth}x${innerHeight}`,
    theme: document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark (system)" : "light (system)"),
    summary: {
      contrastFailures: contrast.length,
      contrastUnknown: unknown.length,
      smallTargets: targets.length,
      missingNames: names.length,
      missingLabels: labels.length,
      noVisibleFocus: focus.length,
      horizontalOverflow: overflowX,
    },
    contrast, unknown, targets, names, labels, focus,
  };
}
