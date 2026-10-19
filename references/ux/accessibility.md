# Accessibility

> **Read when:** building or reviewing any UI (this is part of every done check), or fixing an a11y finding.
> **Contains:** the measurable requirements (contrast, target size, text), keyboard and focus, semantics and ARIA, motion, a quick test routine.
> **Not here:** M3 focus ring and state utilities (`foundations/state-layers.md`), automated page audit (`review/browser-verification.md`).

Target: **WCAG 2.2 AA**, plus Material's stricter touch target.

## Measurable requirements

| Requirement | Threshold | Notes |
|---|---|---|
| Text contrast | ≥ 4.5:1 | Against its actual background |
| Large text contrast | ≥ 3:1 | ≥ 24px regular or ≥ 18.66px bold (`text-headline-small` and up) |
| Non-text contrast | ≥ 3:1 | Icons that convey meaning, field outlines, focus rings, control boundaries, chart marks |
| Touch target | ≥ 48×48px | Material; WCAG 2.5.8 minimum is 24×24px. Use `touch-target` for small visuals. 8px between adjacent targets |
| Body text size | ≥ 12px | `text-body-small` minimum; all sizes in rem |
| Zoom / reflow | 200% zoom, 320px width | No loss of content, no horizontal scroll |
| Text spacing | Survives user overrides | Don't fix heights on text containers |

M3 role pairs (`X` / `on-X`) meet 4.5:1 by construction. Contrast breaks when you mix pairs, use opacity on text (except the 38% disabled rule, which is exempt), put text on images, or use `outline-variant` as a functional boundary.

Text on images: add a scrim gradient (`bg-linear-to-t from-scrim/60`) or place text on a container below the image.

## Keyboard and focus

- Every interactive element is reachable with Tab, in visual order, and operable with Enter/Space (buttons) or arrows (tabs, menus, radios, sliders).
- Focus is always visible: `focus-ring` on every interactive element. `outline-none` without a replacement is a blocker.
- No keyboard traps, except modal dialogs, which trap focus intentionally and release on close (native `<dialog>`).
- Skip link at the top of pages with navigation: `<a href="#main" class="sr-only focus:not-sr-only ...">Skip to content</a>`.
- After an action that removes or moves content (delete, close dialog), move focus somewhere sensible.

## Semantics first, ARIA second

| Need | Use |
|---|---|
| Action | `<button type="button">` |
| Navigation | `<a href>` |
| Form field | `<input>`/`<select>`/`<textarea>` with `<label for>` |
| Groups | `<fieldset>` + `<legend>` |
| Landmarks | `<header>`, `<nav aria-label>`, `<main id="main">`, `<aside>`, `<footer>` |
| Modal | `<dialog>` + `showModal()` |
| Headings | `<h1>`-`<h6>` in order, one `<h1>` per page |

ARIA fills gaps native HTML can't: `aria-current="page"`, `aria-pressed`, `aria-expanded`, `aria-invalid`, `aria-describedby`, `aria-live`, `role="tablist"` etc. A `<div onclick>` is never acceptable as a button.

Names: icon-only buttons need `aria-label` (or `sr-only` text). Decorative icons and images: `aria-hidden="true"` / `alt=""`. Informative images: `alt` that says what matters.

## Color is never the only signal

Errors have an icon and text, not just red. Selected states have a shape or icon change (filled icon, check mark), not just a tint. Links in body text are underlined.

## Motion

- Honor `prefers-reduced-motion` (handled globally in `assets/theme.css`; replace meaningful movement with fades).
- Nothing flashes more than 3 times per second.
- Auto-playing movement longer than 5s needs pause.

## Dynamic content

- Snackbars and status messages: `aria-live="polite"` region present from page load.
- Errors after submit: `role="alert"` or move focus to an error summary.
- Loading regions: `aria-busy="true"` on the region being updated.

## Quick test routine

1. Tab through the whole page: every control reachable, visible focus, logical order.
2. Zoom to 200% and resize to 320px wide: nothing cut off, no horizontal scroll.
3. Switch to dark theme: re-check contrast hot spots (text on tinted containers, disabled states).
4. Run `scripts/audit-page.js` in a browser (see `review/browser-verification.md`) for contrast, targets, names and labels.
5. Reduced motion on: transitions collapse, nothing essential lost.
