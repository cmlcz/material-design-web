# Example: reviewing UI (Branch B)

> **Read when:** you want to see a complete review report before writing one.
> **Contains:** an input component with typical problems, the lint output, and the full report in the required format.
> **Not here:** the checklist itself (`references/review/checklist.md`).

**Request:** "Review this pricing card, it feels off."

## Input

```html
<div class="bg-white rounded-lg shadow-md p-5 dark:bg-gray-800">
  <div class="text-2xl font-bold text-gray-900 dark:text-white">Pro</div>
  <div class="text-[13px] text-gray-400">Billed yearly</div>
  <div class="text-4xl font-extrabold text-purple-600 mt-3">$12</div>
  <div class="flex gap-2 mt-4">
    <button class="bg-purple-600 text-white px-4 py-1 rounded uppercase text-xs outline-none">Buy</button>
    <button class="bg-purple-600 text-white px-4 py-1 rounded uppercase text-xs outline-none">Try free</button>
  </div>
  <div onclick="compare()" class="text-purple-600 text-xs mt-2 cursor-pointer">Compare plans</div>
</div>
```

## Lint output (abridged)

```
card.html:1  ERROR default-palette  bg-white          → Tailwind default palette: replace with an M3 role
card.html:1  WARN  default-radius   rounded-lg        → use rounded-corner-<size>
card.html:1  WARN  default-shadow   shadow-md         → use shadow-elevation-<1-5> or tonal surface tiers
card.html:1  WARN  dark-variant     dark:bg-gray-800  → themes swap role variables
card.html:3  WARN  arbitrary-type   text-[13px]       → use a type role
card.html:6  WARN  outline-none     outline-none      → make sure focus-ring is present
card.html:9  ERROR div-click        <div onclick=     → use <button> or <a href>
...
1 files · 12 errors · 14 warnings · 2 info
```

## Report

```markdown
# UI review: Pricing card

**Scope:** card.html (single component)
**Governing system:** none in place → Material 3
**Verified in browser:** no: snippet only, no page to render
**Summary:** Blocker 2 · Major 4 · Minor 3 · Polish 0. Biggest problem: keyboard users can't see or reach parts of the card. Biggest win: one primary button and role tokens fix most issues at once.

## Findings

### [B5] Blocker · Buttons have no visible focus
- **Location:** card.html:6-7 (`outline-none` on both buttons)
- **Condition:** Tabbing to "Buy" or "Try free" shows no focus indication, both themes.
- **Breaks:** B5 Visible focus on every interactive element (ux/accessibility.md)
- **Why it hurts:** Keyboard users can't tell which button they're about to activate; they may buy instead of starting a trial.
- **Fix:**
  ```html
  <!-- before --> <button class="... outline-none">Buy</button>
  <!-- after  --> <button class="state-layer focus-ring ...">Buy</button>
  ```
- **Verify:** Tab through the card; each button shows a 3px secondary ring.

### [B4, B6] Blocker · "Compare plans" is a clickable div
- **Location:** card.html:9
- **Condition:** `<div onclick>` is not focusable and has no role.
- **Breaks:** B4 keyboard operable; B6 semantic elements (ux/accessibility.md)
- **Why it hurts:** Keyboard and screen-reader users can't reach plan comparison at all.
- **Fix:**
  ```html
  <!-- before --> <div onclick="compare()" class="text-purple-600 text-xs mt-2 cursor-pointer">Compare plans</div>
  <!-- after  --> <a href="/pricing#compare" class="state-layer focus-ring touch-target mt-2 inline-flex h-10 items-center rounded-corner-full px-3 text-label-large text-primary">Compare plans</a>
  ```
- **Verify:** Tab reaches the link; Enter navigates.

### [B1] Major · "Billed yearly" fails contrast
- **Location:** card.html:3 (`text-gray-400` on white)
- **Condition:** #9ca3af on #ffffff = 2.54:1 at 13px, light theme.
- **Breaks:** B1 Text contrast ≥ 4.5:1
- **Why it hurts:** Low-vision users and anyone in sunlight can't read the billing terms, which affect the price they pay.
- **Fix:** `<p class="text-body-medium text-on-surface-variant">Billed yearly</p>` (on-surface-variant on surface-container-low ≈ 8.6:1)
- **Verify:** audit-page.js reports no contrast failure for this element.

### [B3] Major · Buttons are 28px tall
- **Location:** card.html:6-7 (`py-1 text-xs`)
- **Condition:** Rendered height ≈ 24-28px, below the 48px target.
- **Breaks:** B3 Touch targets ≥ 48×48px
- **Why it hurts:** Easy to miss on touch screens, especially for people with motor impairments; the two buttons sit 8px apart, inviting mis-taps between Buy and Try free.
- **Fix:** M3 button height 40px + `touch-target` (see D4 fix below for the full markup).
- **Verify:** audit-page.js reports no small targets in the card.

### [D4, H1] Major · Two equal filled buttons compete
- **Location:** card.html:5-8
- **Condition:** "Buy" and "Try free" are identical filled purple buttons.
- **Breaks:** D4 emphasis ladder (≤ 1 filled button per region); H1 one clear primary action
- **Why it hurts:** Users must read both to decide, and nothing signals which is recommended; this slows the purchase decision.
- **Fix** (assumes Buy is primary; swap if the trial is the business goal):
  ```html
  <div class="mt-6 flex justify-end gap-2">
    <button class="state-layer focus-ring touch-target inline-flex h-10 items-center rounded-corner-full border border-outline px-6 text-label-large text-primary">Try free</button>
    <button class="state-layer focus-ring touch-target inline-flex h-10 items-center rounded-corner-full bg-primary px-6 text-label-large text-on-primary transition-shadow duration-200 ease-standard hover:shadow-elevation-1">Buy Pro</button>
  </div>
  ```
- **Verify:** one filled button in the card, positioned last.

### [C1, C7] Major · Hard-coded palette and per-component dark mode
- **Location:** card.html:1-9 (`bg-white`, `text-gray-*`, `bg-purple-600`, `dark:*`)
- **Condition:** Colors bypass roles; dark mode is patched with `dark:` classes and misses the price and buttons.
- **Breaks:** C1 roles only; C7 dark theme without `dark:` classes
- **Why it hurts:** In dark mode, the price stays #9333ea on #1f2937 (≈ 3.0:1), and every future brand change means editing each component.
- **Fix:** container `bg-surface-container-low`, title `text-on-surface`, price `text-primary`; remove all `dark:` classes (roles flip automatically).
- **Verify:** lint-tokens.mjs reports 0 errors; dark screenshot shows all text readable.

### [C3] Minor · Off-scale type
- **Location:** card.html:2-4 (`text-2xl font-bold`, `text-[13px]`, `text-4xl font-extrabold`)
- **Condition:** Sizes and weights outside the type scale.
- **Breaks:** C3 type roles only
- **Why it hurts:** Inconsistent with other screens; extra-bold price shouts louder than the plan name.
- **Fix:** plan name `text-title-large`, billing `text-body-medium`, price `text-display-small tabular-nums`.
- **Verify:** lint shows no default-type / arbitrary-type hits.

### [C4, C5] Minor · Default radius and shadow
- **Location:** card.html:1, 6-7
- **Condition:** `rounded-lg shadow-md` card, `rounded` buttons.
- **Breaks:** C4 shape scale; C5 tonal elevation first
- **Why it hurts:** Small-radius buttons and a heavy shadow read as a different design system next to M3 components.
- **Fix:** card `rounded-corner-medium` without shadow (tonal tier), buttons `rounded-corner-full`.
- **Verify:** lint clean.

### [H3] Minor · ALL CAPS button labels
- **Location:** card.html:6-7 (`uppercase`)
- **Breaks:** H3 sentence case
- **Why it hurts:** All caps slows reading and looks like shouting; M3 labels are sentence case.
- **Fix:** remove `uppercase`; label "Buy Pro" names what's bought.
- **Verify:** visual check.

## Passed
- B7 accessible names: buttons have text labels.
- B8 color not sole signal: n/a (no states signaled by color).

## Not checked
- E1-E5 layout: single component, no page context.
- F1-F3 states: static card, no data loading.
- I2 browser: no page to render.

## Next step
Say "apply fixes" (all) or list finding IDs to apply.
```
