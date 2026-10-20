# Shape

> **Read when:** choosing corner radius for any element.
> **Contains:** the corner scale, which component uses which size, partial-corner patterns, rules.
> **Not here:** expressive shape variety and morphing (`expressive/expressive.md`).

## Corner scale

| Class | Radius | Used by |
|---|---|---|
| `rounded-corner-none` | 0 | Full-bleed media, top app bar, nav bar, full-screen dialog |
| `rounded-corner-extra-small` | 4px | Text fields (outlined; top corners only on filled), menus, snackbars, plain tooltips |
| `rounded-corner-small` | 8px | Chips, rich tooltips |
| `rounded-corner-medium` | 12px | Cards, small FAB |
| `rounded-corner-large` | 16px | FAB, navigation drawer (end side), extended FAB |
| `rounded-corner-extra-large` | 28px | Dialogs, bottom sheets (top only), large FAB |
| `rounded-corner-full` | pill / circle | Buttons, icon buttons, nav indicators, search bar, badges, switches, sliders |
| `rounded-corner-large-increased` | 20px | Expressive only (`expressive/expressive.md`) |
| `rounded-corner-extra-large-increased` | 32px | Expressive only |
| `rounded-corner-extra-extra-large` | 48px | Expressive only: hero containers, large cards |

## Partial corners

Tailwind side and corner prefixes work with the scale:

- Bottom sheet: `rounded-t-corner-extra-large`
- Filled text field: `rounded-t-corner-extra-small`
- Standard nav drawer attached to the start edge: `rounded-e-corner-large` (logical: flips in RTL)

## Rules

- **Shape signals size and role.** Small things get small or full radius; big containers get larger radius. A dialog with 4px corners or a chip with 28px corners reads wrong.
- **Nested corners:** inner radius = outer radius − padding (never larger than the outer). A 12px card with 8px padding holding an image: image radius 4px (`rounded-corner-extra-small`).
- **Full-width elements touching screen edges** drop their radius on those edges.
- Images inside a card that bleed to the card edge inherit the card's top radius (`rounded-t-corner-medium` or `overflow-hidden` on the card).
- State layers inherit radius automatically (`border-radius: inherit` in the `state-layer` utility).

## Example

```html
<div class="overflow-hidden rounded-corner-medium bg-surface-container-highest">
  <img src="cover.jpg" alt="Mountain lake at dawn" class="aspect-video w-full object-cover">
  <div class="p-4">
    <h3 class="text-title-medium text-on-surface">Lake trip</h3>
  </div>
</div>
```
