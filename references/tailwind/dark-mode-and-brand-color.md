# Dark mode and brand color

> **Read when:** adding a theme switch, fixing dark-mode bugs, or replacing the baseline purple with a brand color.
> **Contains:** how theming works in `assets/theme.css`, the theme toggle, generating a scheme from a seed color, contrast levels, high-contrast schemes.
> **Not here:** what each role is for (`foundations/color.md`).

## How theming works

Every role variable holds both values: `--md-sys-color-primary: light-dark(#6750a4, #d0bcff);`. The browser picks one from the element's `color-scheme`:

- Default: `:root { color-scheme: light dark }` follows the OS setting.
- Forced: `<html data-theme="dark">` or `data-theme="light"` overrides it.

Components name roles only, so they flip automatically. **Components carry no `dark:` classes.** A `dark:` class in component code means a raw color crept in; fix the token, not the component.

`light-dark()` is Baseline 2024 (Chrome 123, Edge 123, Firefox 120, Safari 17.5). For older browsers, write the light values in `:root` and repeat the dark values under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` and `:root[data-theme="dark"] { ... }`.

## Theme toggle

Run this inline in `<head>` (before CSS paints) to avoid a flash of the wrong theme:

```html
<script>
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  } catch {}
</script>
```

A three-way control (System / Light / Dark) is the M3-friendly pattern; use a segmented button (see `components/actions.md`):

```js
function setTheme(choice) { // "system" | "light" | "dark"
  const root = document.documentElement;
  if (choice === "system") { delete root.dataset.theme; localStorage.removeItem("theme"); }
  else { root.dataset.theme = choice; localStorage.setItem("theme", choice); }
}
```

## Brand color: generate, don't hand-pick

Never hand-tune hex values per role: a generated scheme guarantees the `on-` pairs meet contrast in both themes.

Option A, Material Theme Builder (no code): https://material-foundation.github.io/material-theme-builder/ → set source color → Export → "Web (CSS)". Copy each role's light and dark value into the matching `light-dark()` pair in your theme file.

Option B, `@material/material-color-utilities` (scriptable, runtime or build time):

```js
// npm install @material/material-color-utilities
import { argbFromHex, hexFromArgb, themeFromSourceColor } from "@material/material-color-utilities";

const theme = themeFromSourceColor(argbFromHex("#0b57d0"));
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const light = theme.schemes.light.toJSON();
const dark = theme.schemes.dark.toJSON();
const lines = Object.keys(light).map(
  (role) => `  --md-sys-color-${kebab(role)}: light-dark(${hexFromArgb(light[role])}, ${hexFromArgb(dark[role])});`
);
console.log(`:root {\n${lines.join("\n")}\n}`);
```

Notes: `themeFromSourceColor` returns the core roles. For the full role set (surface-container tiers, fixed roles), use the newer `DynamicScheme` API (`SchemeTonalSpot` with `MaterialDynamicColors`) or the Theme Builder export. Keep any role you can't generate at its baseline value and mention it to the user.

**Scheme variants** (when using `DynamicScheme`): Tonal Spot is the default calm M3 look; Vibrant and Expressive raise chroma for bolder products; Fidelity / Content keep the brand color recognizable (use when the brand hex must appear as-is).

## Contrast levels

Material schemes come in standard, medium and high contrast. Offer high contrast when the audience includes low-vision users or the UI is used outdoors. Generate with `contrastLevel` 0.5 (medium) or 1.0 (high) in `DynamicScheme`, and expose it as `data-contrast="high"` with its own block of variables.

## Custom semantic colors

For success/warning, harmonize a fixed hue toward the brand so it looks native: `Blend.harmonize(argbFromHex("#1e8e3e"), sourceArgb)` from material-color-utilities, then build its four roles (`success`, `on-success`, `success-container`, `on-success-container`) from that color's tonal palette: light tones 40/100/90/10, dark tones 80/20/30/90.
