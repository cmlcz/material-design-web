# State layers and interaction states

> **Read when:** writing hover, focus, pressed, dragged, selected or disabled styles for any interactive element.
> **Contains:** the state-layer model, the `state-layer` / `focus-ring` / `touch-target` utilities, disabled and selected recipes, examples.
> **Not here:** motion timing of state changes (`foundations/motion.md`).

## The model

M3 shows interaction with a translucent overlay (the **state layer**) in the element's **content color**, laid over the container. Because the overlay color is the content color, it works on every container in both themes without per-color hover shades.

| State | Overlay opacity | Notes |
|---|---|---|
| Hover | 8% | Pointer devices only |
| Focus | 12% | Plus the focus ring for keyboard focus |
| Pressed | 12% | (Ripple in native M3; a flat overlay is the web equivalent) |
| Dragged | 16% | Plus elevation +1 |
| Disabled | none | Container `on-surface` 12%, content `on-surface` 38% |

## The utilities (from `assets/theme.css`)

- `state-layer`: adds the overlay via `::before`, colored with `currentColor`, with hover/focus-visible/active opacities. The overlay sits behind the content and inherits the radius.
- `focus-ring`: 3px `secondary` outline offset 2px, shown on `:focus-visible` only.
- `touch-target`: grows the hit area to at least 48×48px via `::after` without changing the visual size.

Put all three on every small interactive control. Larger controls (≥48px) need only `state-layer focus-ring`.

## Recipes

Filled button with all states:

```html
<button class="state-layer focus-ring inline-flex h-10 items-center gap-2 rounded-corner-full bg-primary px-6 text-label-large text-on-primary transition-shadow duration-200 ease-standard hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none">
  Save changes
</button>
```

Selected item (navigation, list, chip): the container switches to `secondary-container` and the state layer keeps working on top of it:

```html
<a href="/inbox" aria-current="page" class="state-layer focus-ring flex h-14 items-center gap-3 rounded-corner-full px-4 text-label-large text-on-surface-variant aria-[current=page]:bg-secondary-container aria-[current=page]:text-on-secondary-container">
  Inbox
</a>
```

Disabled that must stay focusable (to explain why it is disabled): use `aria-disabled="true"` instead of `disabled`, style with `aria-disabled:` variants, and block the action in script.

```html
<button aria-disabled="true" aria-describedby="why" class="state-layer focus-ring h-10 rounded-corner-full px-6 text-label-large aria-disabled:bg-on-surface/12 aria-disabled:text-on-surface/38 aria-disabled:cursor-not-allowed">Publish</button>
<p id="why" class="text-body-small text-on-surface-variant">Add a title to publish.</p>
```

## Rules

- Hover never changes the container color to a different role (`hover:bg-blue-700`). The state layer does it.
- Focus must be visible on keyboard navigation for every interactive element. `outline-none` without `focus-ring` is a blocker.
- Disabled uses `on-surface` at 12% / 38% regardless of the element's normal color, so all disabled controls look alike.
- Touch-only devices: hover styles must not be the only way to discover something (tooltips on hover need a tap or focus equivalent).
