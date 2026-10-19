# Spacing and density

> **Read when:** setting padding, gaps, margins, or tightening/loosening a layout.
> **Contains:** the 4px grid, common spacing values with their jobs, grouping rules, density levels, examples.
> **Not here:** page margins per window size class (`layout/window-size-classes.md`).

## The grid

All spacing is a multiple of **4px**; most is a multiple of **8px**. Tailwind's spacing scale is already 4px per step (`p-1` = 4px, `p-4` = 16px), so use the scale and never arbitrary values.

| px | Class step | Typical job |
|---|---|---|
| 4 | `1` | Icon-to-label inside dense chips; tight stacks of related lines |
| 8 | `2` | Gap between icon and label in buttons (`gap-2`), between chips, between button groups |
| 12 | `3` | Gap inside list items between leading element and text; between rail items |
| 16 | `4` | Default container padding (cards, list item horizontal padding, compact page margin) |
| 24 | `6` | Dialog padding, page margin medium+, gap between panes, between sections in a card |
| 32 | `8` | Between major page sections on compact |
| 48 / 64 | `12` / `16` | Between major sections on expanded+ |

## Grouping (proximity)

Spacing is how users see structure. Elements that belong together are closer to each other than to anything else:

- Space **inside** a group < space **between** groups. A 4px gap between a title and its subtitle, 16px to the next card's title.
- A label sits closer to its field than to the previous field.
- Don't separate everything with dividers; use space first, a divider (`border-outline-variant`) only when space alone is ambiguous (dense lists, tables).

## Density

M3 components have a default density. Higher density (desktop data tools, tables) reduces **height** in 4px steps: −4px (density −1), −8px (−2), −12px (−3).

- Never reduce below the 48px touch target on touch-capable layouts; at compact width keep default density.
- Apply density to whole regions (a data table), not to random single components.
- Body text in dense layouts: `text-body-medium`; never below `text-body-small`.

## Example

```html
<section class="space-y-6 rounded-corner-medium bg-surface-container-low p-4 medium:p-6">
  <header class="space-y-1">
    <h2 class="text-title-large text-on-surface">Notifications</h2>
    <p class="text-body-medium text-on-surface-variant">Choose what we email you about.</p>
  </header>
  <div class="space-y-2">...</div>
</section>
```

Wrong: `p-[18px]`, `mt-[7px]`, every block separated by `<hr>`, equal spacing everywhere (no grouping).
