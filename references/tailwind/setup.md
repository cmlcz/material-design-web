# Tailwind v4 setup for M3

> **Read when:** a project has no M3 tokens yet, or you need to wire `assets/theme.css` into a build.
> **Contains:** install paths (Vite, CLI, PostCSS, CDN prototype), how to add the theme, icons, fonts, how to verify.
> **Not here:** class names (`tailwind/naming.md`), theming and brand colors (`tailwind/dark-mode-and-brand-color.md`).

## 1. Detect what exists

Check before installing anything:

- `package.json` → `tailwindcss` version. v4 uses `@import "tailwindcss"` in CSS; v3 uses `tailwind.config.js` and `@tailwind base`.
- An existing `@theme` block or `--md-sys-*` variables → reuse and extend; don't add a second set.
- Another design system (see the gate in `SKILL.md`) → stop and defer to it.

**Tailwind v3 project:** this skill targets v4. Upgrade with `npx @tailwindcss/upgrade` (with the user's agreement), or translate tokens into `theme.extend` in `tailwind.config.js` using the same names.

## 2. Install (pick the project's build tool)

Vite (React, Vue, Svelte, plain):

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [tailwindcss()] });
```

Next.js / PostCSS:

```bash
npm install tailwindcss @tailwindcss/postcss
```

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

CLI only:

```bash
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i ./src/app.css -o ./dist/app.css --watch
```

Single-file prototype (no build; not for production):

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.11"></script>
<style type="text/tailwindcss">
  @import "tailwindcss";
  /* then the contents of assets/theme.css */
</style>
```

**Always write the explicit `@import "tailwindcss";` line first.** The browser build adds that import automatically only when the block contains no `@import` text anywhere, comments included. If any `@import` appears (a pasted comment, a font import) and the Tailwind import is missing, the page renders as unstyled HTML with no error in the console. `lint-tokens.mjs` flags this as `tw-browser-import`.

## 3. Add the theme

Copy `assets/theme.css` into the project (for example `src/styles/theme.css`) and import it right after Tailwind:

```css
/* src/app.css */
@import "tailwindcss";
@import "./styles/theme.css";
```

Keep the copied file as the project's **single source of truth** for tokens. Change values there, never inline.

## 4. Icons and fonts

Material Symbols (variable icon font):

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
<span class="material-symbols-outlined" aria-hidden="true">settings</span>
```

- Icon size is 24px by default (`text-[24px]` is not needed; the font sets it). For 18px icons in buttons use `text-[18px]` (the one allowed arbitrary value, because icon size is not a type role).
- **Never put display utilities on the icon span** (`hidden`, `inline`, `flex`, `grid`...). Google's stylesheet sets `.material-symbols-outlined { display: inline-block }` outside any cascade layer, so it beats every Tailwind utility: a `hidden` check icon shows anyway. Toggle or lay out a plain wrapper instead: `<span class="hidden in-aria-pressed:inline-flex"><span class="material-symbols-outlined">check</span></span>`. `lint-tokens.mjs` flags this as `icon-display`.
- Filled variant for selected states: `style="font-variation-settings: 'FILL' 1"`.
- Decorative icons get `aria-hidden="true"`; icon-only buttons need an accessible name (`aria-label` or `sr-only` text).

Fonts: see `foundations/typography.md`.

## 5. Verify the setup

Build once and confirm the generated CSS contains `.bg-primary`, `.text-body-large`, `.rounded-corner-medium` and the `@media (width >= 37.5rem)` block for `medium:`. If `bg-primary` is missing, the theme file isn't imported or the source file isn't scanned (add `@source "../path";` to `app.css`).

Single-file page: run `lint-tokens.mjs` on it (catches the missing-import trap above). With a browser tool, also check that `getComputedStyle(document.body).backgroundColor` matches `surface` and a `h-12` button measures 48px tall. A page of plain Times-like text means the theme did not compile.
