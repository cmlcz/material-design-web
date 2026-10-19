# Color roles

> **Read when:** choosing any background, text, icon, border or overlay color.
> **Contains:** the role model, every role with its job, pairing rules, surface tiers, decision table, examples.
> **Not here:** Tailwind setup (`tailwind/setup.md`), dark mode and brand colors (`tailwind/dark-mode-and-brand-color.md`), contrast law (`ux/accessibility.md`).

## The model in one paragraph

M3 never asks "which purple?". It asks "what job does this pixel do?". A scheme is generated from a seed color into tonal palettes, and each **role** picks a tone. Light and dark themes pick different tones for the same role, so code that names roles is themed for free and stays accessible: every container role has an `on-` role with guaranteed contrast against it.

## The pairing rule

Fill with role **X**, put content in **on-X**. That's the whole contract.

| Container (bg-) | Content on it (text- / fill- / border-) |
|---|---|
| `primary` | `on-primary` |
| `primary-container` | `on-primary-container` |
| `secondary` / `secondary-container` | `on-secondary` / `on-secondary-container` |
| `tertiary` / `tertiary-container` | `on-tertiary` / `on-tertiary-container` |
| `error` / `error-container` | `on-error` / `on-error-container` |
| `surface`, `surface-container-*`, `surface-dim`, `surface-bright` | `on-surface` (primary content), `on-surface-variant` (secondary content), and accent roles `primary`, `secondary`, `tertiary`, `error` for text/icons |
| `inverse-surface` | `inverse-on-surface`, accent `inverse-primary` |
| `primary-fixed` / `primary-fixed-dim` | `on-primary-fixed`, `on-primary-fixed-variant` (same in both themes) |

Mixing pairs (`text-on-primary` on `bg-primary-container`) breaks contrast in one of the two themes even if it looks fine in the other.

## Roles and their jobs

**Accent roles** (draw attention, in descending emphasis):

- `primary`: the most prominent actions and active states. Filled button, FAB container (as `primary-container`), selected controls, progress, focus of text fields.
- `secondary`: less prominent accents. Tonal button (`secondary-container`), active navigation indicator, filter chip selected, focus ring.
- `tertiary`: contrasting accent to balance primary/secondary, or to highlight one special element (a badge-like callout, an input in a special state). Use sparingly.
- `error`: errors only. Never decorative.

**Container vs base:** `primary` is a strong fill for small high-emphasis elements; `primary-container` is a softer fill for larger or less urgent elements. Big areas of `primary` are visually heavy; prefer `primary-container` for anything larger than a button.

**Neutral roles** (structure):

- `surface`: default page/background color for most of the UI.
- `background`: kept for compatibility; equals `surface` in the baseline. Prefer `surface`.
- `on-surface`: main text and icons. `on-surface-variant`: secondary text, helper text, inactive icons, placeholder.
- `surface-variant`: legacy role; prefer `surface-container-highest` for fills.
- `outline`: important boundaries (text field outline, outlined button border). Meets 3:1.
- `outline-variant`: decorative boundaries (dividers, card outlines). Does not need 3:1, so never use it as the only boundary of an interactive control.
- `inverse-surface` / `inverse-on-surface` / `inverse-primary`: elements that contrast against the rest of the UI: snackbars, plain tooltips.
- `scrim`: overlay behind modals, used with opacity (`bg-scrim/32`). `shadow`: shadow color.
- `surface-tint`: legacy tonal-elevation color. Not needed when you use container tiers.

## Surface container tiers

Five tiers from lowest to highest emphasis. Use them to build hierarchy **without shadows**:

| Tier | Typical use |
|---|---|
| `surface-container-lowest` | Content you want to sit "below" the page, e.g. a card in a busy feed |
| `surface-container-low` | Elevated cards, bottom sheets, nav drawer (modal) |
| `surface-container` | Navigation bar, navigation rail (modal), menus, default containers |
| `surface-container-high` | Dialogs, search bar, filled card alternative |
| `surface-container-highest` | Filled text field, filled card, switch track (unselected) |

`surface-dim` and `surface-bright` keep their relationship in both themes (dim is always darker than bright); use them for large background areas that must read as darker/brighter regardless of theme.

**Nesting rule:** a nested region steps one tier up (or down) from its parent, never sideways to the same tier: the boundary must be visible.

## Decision table

| I'm coloring... | Use |
|---|---|
| Page background | `bg-surface text-on-surface` |
| A sidebar or rail beside content | `bg-surface-container` (or `bg-surface` with a divider) |
| Main call to action | `bg-primary text-on-primary` |
| Secondary action that still needs a fill | `bg-secondary-container text-on-secondary-container` |
| A selected item in a list or nav | `bg-secondary-container text-on-secondary-container` |
| A link in body text | `text-primary underline` |
| Helper text, timestamps, metadata | `text-on-surface-variant` |
| Divider | `border-outline-variant` |
| Text field border | `border-outline`, focused `border-primary` |
| Error message | `text-error`; error banner `bg-error-container text-on-error-container` |
| Success / warning | Not M3 roles. Add custom roles (see `tailwind/dark-mode-and-brand-color.md`); never reuse `tertiary` as "success" silently |
| Disabled content | `text-on-surface/38`, container `bg-on-surface/12` |
| Modal backdrop | `bg-scrim/32` |
| Snackbar | `bg-inverse-surface text-inverse-on-surface`, action `text-inverse-primary` |

## Examples

Good: card with metadata and an accent action.

```html
<article class="rounded-corner-medium bg-surface-container-low p-4 shadow-elevation-1">
  <h3 class="text-title-medium text-on-surface">Quarterly report</h3>
  <p class="text-body-medium text-on-surface-variant">Updated 2 hours ago</p>
  <button class="state-layer focus-ring mt-4 h-10 rounded-corner-full px-3 text-label-large text-primary">Open</button>
</article>
```

Wrong, and why:

```html
<!-- Hex value: bypasses theming and dark mode -->
<div class="bg-[#f3edf7]">...</div>
<!-- Default palette: not a role, no on- pair, no dark variant -->
<button class="bg-purple-600 text-white">Save</button>
<!-- Broken pair: on-primary text on primary-container fails contrast -->
<div class="bg-primary-container text-on-primary">...</div>
```

## Custom roles

When a product needs a color M3 lacks (success, warning, brand category colors), add a full role group with the same shape: `--md-sys-color-success`, `on-success`, `success-container`, `on-success-container`, each with light and dark values, then map it in `@theme inline`. Generate the tones from a palette (see `tailwind/dark-mode-and-brand-color.md`) so contrast holds.
