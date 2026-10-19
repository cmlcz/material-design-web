# Elevation

> **Read when:** deciding whether something gets a shadow, or how to show depth.
> **Contains:** levels 0-5 with their components, tonal vs shadow elevation, rules.
> **Not here:** surface container tiers in detail (`foundations/color.md`).

## Two ways to show depth

1. **Tonal (preferred):** a higher `surface-container-*` tier. Works in dark mode, costs nothing, keeps the UI calm.
2. **Shadow:** `shadow-elevation-<n>`. Use when an element floats over other content or moves (FAB, menu, dragged card), or needs to separate from a busy background like an image.

Most M3 components at rest use tonal elevation only. Add shadow for floating and for interaction feedback.

## Levels

| Level | Height | Class | Components |
|---|---|---|---|
| 0 | 0dp | `shadow-none` | Filled/outlined cards, filled buttons at rest, text fields, nav bar, top app bar at rest, standard side sheets |
| 1 | 1dp | `shadow-elevation-1` | Elevated card, elevated button, modal bottom sheet, filled button on hover |
| 2 | 3dp | `shadow-elevation-2` | Menus, top app bar on scroll (as tone: `bg-surface-container`), elevated card hover, rich tooltip |
| 3 | 6dp | `shadow-elevation-3` | FAB at rest, dialogs (tone), search view, snackbar |
| 4 | 8dp | `shadow-elevation-4` | FAB hover, elevated hover states |
| 5 | 12dp | `shadow-elevation-5` | Rarely: dragged items |

Interaction raises an element by one level: hover adds one, pressed returns to rest.

```html
<button class="state-layer focus-ring touch-target size-14 rounded-corner-large bg-primary-container text-on-primary-container shadow-elevation-3 transition-shadow duration-200 ease-standard hover:shadow-elevation-4">
  <span class="material-symbols-outlined" aria-hidden="true">edit</span>
  <span class="sr-only">Compose</span>
</button>
```

## Rules

- Never use shadow alone to separate a region from its neighbor. Use a tier change or an `outline-variant` divider.
- One shadow per element; do not stack custom shadows.
- Shadows on dark themes are barely visible; tone does the work. This is why tonal comes first.
- Scrolled top app bar: switch from `bg-surface` to `bg-surface-container` (tone), not to a shadow.
