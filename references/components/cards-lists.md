# Cards, lists and dividers

> **Read when:** presenting collections of content: cards, lists, list items, dividers, data rows.
> **Contains:** card types and specs, list item anatomy and heights, recipes, card vs list decision, rules.
> **Not here:** feed grid layout across widths (`layout/window-size-classes.md`).

## Card or list?

- **List**: items are homogeneous and scanned top-to-bottom (messages, settings, contacts). Denser, faster to scan.
- **Card**: items are heterogeneous or rich (image + text + actions), or are browsed in a grid. Each card is one subject.

When in doubt, use a list. Cards are for content that benefits from containment.

## Cards

All cards: `rounded-corner-medium`, padding 16px (`p-4`), one subject per card.

| Type | Classes | Use |
|---|---|---|
| Elevated | `bg-surface-container-low shadow-elevation-1` | Needs separation from a busy or same-tone background |
| Filled | `bg-surface-container-highest` | Subtle containment on `surface` (default choice) |
| Outlined | `bg-surface border border-outline-variant` | Strong visual boundary, lowest emphasis |

Anatomy (all optional except content): media → headline (`text-title-medium`) → subhead (`text-body-medium text-on-surface-variant`) → supporting text (`text-body-medium`) → actions (end aligned, text or tonal buttons).

```html
<article class="flex flex-col overflow-hidden rounded-corner-medium bg-surface-container-highest">
  <img src="trail.jpg" alt="Forest trail in autumn" class="aspect-[16/9] w-full object-cover">
  <div class="flex flex-col gap-1 p-4">
    <h3 class="text-title-medium text-on-surface">Black Forest loop</h3>
    <p class="text-body-medium text-on-surface-variant">12 km · 4 h · Moderate</p>
  </div>
  <div class="flex justify-end gap-2 px-4 pb-4">
    <button class="state-layer focus-ring touch-target h-10 rounded-corner-full px-3 text-label-large text-primary">Save</button>
    <button class="state-layer focus-ring touch-target h-10 rounded-corner-full bg-secondary-container px-6 text-label-large text-on-secondary-container">Start route</button>
  </div>
</article>
```

### Clickable cards

The whole card is one target: make the title a link and stretch it, so screen readers get one clear link and nested buttons still work.

```html
<article class="state-layer relative rounded-corner-medium bg-surface-container-highest p-4 has-focus-visible:outline-3 has-focus-visible:outline-secondary">
  <h3 class="text-title-medium text-on-surface">
    <a href="/trips/42" class="outline-none after:absolute after:inset-0">Lake trip</a>
  </h3>
  <p class="text-body-medium text-on-surface-variant">3 days · 5 people</p>
</article>
```

Hover on clickable elevated cards raises elevation by one (`hover:shadow-elevation-2`).

## Lists

| Variant | Height | Content |
|---|---|---|
| One-line | 56px | headline |
| Two-line | 72px | headline + supporting text (1 line) |
| Three-line | 88px | headline + supporting text (2 lines) |

Anatomy: leading (icon 24px / avatar 40px / thumbnail 56px) → text (headline `text-body-large text-on-surface`, supporting `text-body-medium text-on-surface-variant`) → trailing (`text-label-small` meta, icon, checkbox, switch). Padding 16px start/end, 16px gap between leading and text (`gap-4`), 12px vertical padding minimum.

```html
<ul role="list" class="bg-surface">
  <li>
    <a href="/chat/1" class="state-layer focus-ring flex min-h-[72px] items-center gap-4 px-4 py-2">
      <img src="ana.jpg" alt="" class="size-10 shrink-0 rounded-corner-full object-cover">
      <div class="min-w-0 flex-1">
        <p class="truncate text-body-large text-on-surface">Ana Lopes</p>
        <p class="truncate text-body-medium text-on-surface-variant">Can we move the call to 3?</p>
      </div>
      <span class="text-label-small text-on-surface-variant">10:42</span>
    </a>
  </li>
</ul>
```

Selected list item: `bg-secondary-container text-on-secondary-container` (`aria-current` or `aria-selected`). Unread or important: weight change on the headline (`font-medium`), not a different color.

## Dividers

1px `border-outline-variant`. Full-width between sections; inset (`ms-4` or aligned to text start, `ms-[72px]` with avatars) between list items. Prefer spacing over dividers; use dividers in dense lists and to separate distinct groups.

```html
<hr class="border-outline-variant">
```

## Rules

- Lists with actions per item: trailing icon button or overflow menu, never multiple text buttons per row.
- Truncate long text with `truncate` / `line-clamp-2` and keep full text available (title attribute or detail view).
- Long lists: virtualize or paginate; show a loading row at the end, not a page spinner.
- Avatar `alt=""` when the name is already in the text next to it.
