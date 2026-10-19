# Typography

> **Read when:** choosing text size, weight or font for any text.
> **Contains:** the 15 type roles with values, which role for which job, font setup, rules, examples.
> **Not here:** color of text (`foundations/color.md`), UX copy and hierarchy strategy (`ux/content-hierarchy.md`).

## The type scale

Five roles × three sizes. Each Tailwind class (`text-<role>-<size>`) sets size, line height, letter spacing and weight together, so never add `font-*`, `leading-*` or `tracking-*` to override a role without a reason.

| Class | Size / line height | Weight | Job |
|---|---|---|---|
| `text-display-large` | 57 / 64px | 400 | Hero numbers or short hero text on large screens |
| `text-display-medium` | 45 / 52px | 400 | Hero text, medium screens |
| `text-display-small` | 36 / 44px | 400 | Hero text, compact screens |
| `text-headline-large` | 32 / 40px | 400 | Page title on large screens |
| `text-headline-medium` | 28 / 36px | 400 | Page title |
| `text-headline-small` | 24 / 32px | 400 | Dialog title, section title, medium app bar title |
| `text-title-large` | 22 / 28px | 400 | Top app bar title, prominent card title |
| `text-title-medium` | 16 / 24px | 500 | Card title, list section header, subheading |
| `text-title-small` | 14 / 20px | 500 | Tab label, small headings, dense card titles |
| `text-body-large` | 16 / 24px | 400 | Default reading text, list item headline, text field input |
| `text-body-medium` | 14 / 20px | 400 | Secondary text, list supporting text, dialog body |
| `text-body-small` | 12 / 16px | 400 | Captions, helper and error text under fields |
| `text-label-large` | 14 / 20px | 500 | Button labels, chips, nav drawer items |
| `text-label-medium` | 12 / 16px | 500 | Navigation bar labels, badges with text |
| `text-label-small` | 11 / 16px | 500 | Tiny labels, timestamps in dense layouts |

Values are in rem in `assets/theme.css`, so they scale with the user's browser font size.

## Choosing a role

- **Display** is for short, important text or numbers. Never paragraphs.
- **Headline** marks the top of a page or major region. One headline-level role per region.
- **Title** labels medium-emphasis groups: cards, sections, app bars.
- **Body** is for reading. Default to `text-body-large` on compact screens for comfort; `text-body-medium` for dense desktop UI.
- **Label** is for UI chrome: buttons, chips, tabs, nav labels. Not for reading text.

Hierarchy comes from skipping at least one step between levels (headline-small → title-medium → body-medium), plus color (`on-surface` vs `on-surface-variant`). Avoid bold body text as a heading substitute.

## Responsive type

Step a role up as the window grows, using the window size class variants:

```html
<h1 class="text-headline-small medium:text-headline-medium expanded:text-headline-large">Inbox</h1>
```

## Fonts

- `font-plain` (default for all text) and `font-brand` (display and headline, optional) are defined in `assets/theme.css`. Both default to Roboto Flex → Roboto → system UI.
- Load the font yourself, for example:

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,700&display=swap" rel="stylesheet">
  ```

- A brand typeface replaces `--font-brand`; keep `--font-plain` highly legible for body and labels.

## Rules

- Minimum readable body text is `text-body-small` (12px). Nothing smaller than `text-label-small` (11px), and only for labels.
- Line length for reading text: 40-80 characters (`max-w-prose` or `max-w-[65ch]`).
- Sentence case for all UI text (buttons, titles, labels). Not ALL CAPS: M3 buttons are sentence case.
- Numbers in tables and counters: add `tabular-nums` so digits align.

## Examples

```html
<!-- Section header + list item: title, body, supporting -->
<h2 class="text-title-small text-on-surface-variant px-4 pt-4">Today</h2>
<li class="px-4 py-2">
  <p class="text-body-large text-on-surface">Meeting with design</p>
  <p class="text-body-medium text-on-surface-variant">10:00 - 11:00, Room 4</p>
</li>
```

Wrong: `text-[15px] font-semibold` (off-scale, bypasses the role), `text-2xl` (Tailwind default scale removed by the theme), `uppercase tracking-widest` on buttons.
