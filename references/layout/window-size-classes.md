# Window size classes and canonical layouts

> **Read when:** laying out a page that must work from phone to desktop, or choosing panes.
> **Contains:** the five width classes with breakpoints, margins and panes; canonical layouts (list-detail, feed, supporting pane); Tailwind recipes.
> **Not here:** which navigation component per class (`layout/navigation-patterns.md`), spacing scale (`layout/spacing-density.md`).

## The classes

M3 lays out by **window width**, not device type. In Tailwind the variants are `medium:`, `expanded:`, `large:`, `extra-large:` (defined in `assets/theme.css`); compact is unprefixed (mobile first).

| Class | Width | Variant | Margin | Panes | Typical device |
|---|---|---|---|---|---|
| Compact | < 600px | (none) | 16px (`px-4`) | 1 | Phone portrait |
| Medium | 600-839px | `medium:` | 24px (`medium:px-6`) | 1 (2 optional) | Tablet portrait, foldable |
| Expanded | 840-1199px | `expanded:` | 24px | 2 | Tablet landscape, small laptop |
| Large | 1200-1599px | `large:` | 24px | 2 | Desktop |
| Extra-large | ≥ 1600px | `extra-large:` | 24px | 2-3 | Large desktop |

Space between panes: 24px (`gap-6`). Height classes (compact < 480, medium 480-899, expanded ≥ 900) matter for landscape phones: hide or collapse top app bars when height is compact (`[@media(height<30rem)]:hidden`).

## Canonical layouts

Pick one per screen; they cover most apps.

### 1. List-detail

A list and the selected item's detail. Compact: one pane, navigating to detail replaces the list. Expanded+: both side by side.

```html
<div class="grid h-dvh grid-cols-1 gap-6 px-4 medium:px-6 expanded:grid-cols-[minmax(320px,2fr)_3fr]">
  <section aria-label="Messages" class="overflow-y-auto rounded-corner-large bg-surface-container-low">...</section>
  <section aria-label="Message detail" class="hidden overflow-y-auto rounded-corner-large bg-surface expanded:block">...</section>
</div>
```

On compact, show detail as its own route/view with a back button in the top app bar.

### 2. Feed

A grid of comparable items (cards, products, media). Columns grow with width.

```html
<ul class="grid grid-cols-1 gap-4 px-4 medium:grid-cols-2 medium:gap-6 medium:px-6 expanded:grid-cols-3 large:grid-cols-4">
  <li>...</li>
</ul>
```

Prefer `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` when items have a natural minimum width.

**Stat tiles (KPIs, summary numbers) are the exception: start at 2 columns.** A stat tile holds only a label, a number and a trend, so one per row on compact wastes the first screen and pushes the content below the fold. Keep tiles compact (`p-4`, number in `text-headline-medium`, label in `text-label-large`):

```html
<ul class="grid grid-cols-2 gap-3 px-4 medium:grid-cols-4 medium:gap-4 medium:px-6">
  <li class="rounded-corner-medium bg-surface-container p-4">
    <p class="text-label-large text-on-surface-variant">Orders</p>
    <p class="mt-1 text-headline-medium text-on-surface">148</p>
    <p class="mt-1 text-label-medium text-on-surface-variant">+13% vs yesterday</p>
  </li>
</ul>
```

With an odd count (3 tiles), let the last tile span on compact (`last:col-span-2 medium:last:col-span-1`) or add a fourth useful number such as average order value.

### 3. Supporting pane

Primary content plus secondary content (filters, details, comments). Compact: supporting pane becomes a bottom sheet or a section below. Expanded+: fixed-width side pane.

```html
<div class="flex flex-col gap-6 px-4 medium:px-6 expanded:flex-row">
  <main class="min-w-0 flex-1">...</main>
  <aside class="expanded:w-90 expanded:shrink-0">...</aside>
</div>
```

## Rules

- **Content width:** reading text never spans more than ~65ch; center it or give it a column. Wide screens get more panes, not wider paragraphs.
- **Body max width** on single-pane pages at large+: `max-w-[1040px] mx-auto` or similar, so layouts don't stretch thin.
- **Don't scale up; reveal.** Bigger windows show more panes or columns; they don't just blow up buttons and text.
- **No horizontal page scroll** at any width (test at 320px).
- Use container queries (`@container`, `@md:`) for components whose layout depends on their slot, not the window.
