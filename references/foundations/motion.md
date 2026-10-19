# Motion

> **Read when:** adding any transition or animation.
> **Contains:** easing and duration tokens, which pair to use for which movement, transition patterns, reduced motion, examples.
> **Not here:** spring physics and shape morphing for Expressive (`expressive/expressive.md`).

## Tokens

Easing (Tailwind `ease-*`):

| Class | Curve | Use |
|---|---|---|
| `ease-emphasized` | cubic-bezier(0.2, 0, 0, 1) | Default for most transitions that begin and end on screen |
| `ease-emphasized-decelerate` | cubic-bezier(0.05, 0.7, 0.1, 1) | Elements **entering** the screen |
| `ease-emphasized-accelerate` | cubic-bezier(0.3, 0, 0.8, 0.15) | Elements **exiting** the screen |
| `ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Small, utility transitions (color, opacity, state layers) |
| `ease-standard-decelerate` | cubic-bezier(0, 0, 0, 1) | Small elements entering |
| `ease-standard-accelerate` | cubic-bezier(0.3, 0, 1, 1) | Small elements exiting |

Duration (Tailwind `duration-<ms>`; the M3 token name is in brackets):

| Group | Values | Use |
|---|---|---|
| Short | `duration-50` (short1), `duration-100` (short2), `duration-150` (short3), `duration-200` (short4) | State changes, selection controls, small fades |
| Medium | `duration-250`, `duration-300`, `duration-350`, `duration-400` (medium1-4) | Expanding cards, menus, sheets entering, most component transitions |
| Long | `duration-450` ... `duration-600` (long1-4) | Large, full-screen transitions |
| Extra long | `duration-700` ... `duration-1000` | Rare; ambient or very large movement |

Hand-written CSS can use `var(--md-sys-motion-duration-medium2)` etc.

## Pairing guide

| Movement | Easing | Duration |
|---|---|---|
| Hover / focus / pressed color, state layer | standard | short3-short4 (150-200ms) |
| Switch thumb, checkbox, radio | standard | short4 (200ms) |
| Menu, tooltip appearing | emphasized-decelerate | short4-medium1 (200-250ms) |
| Menu, tooltip disappearing | emphasized-accelerate | short2-short3 (100-150ms) |
| Dialog / bottom sheet entering | emphasized-decelerate | medium2-medium4 (300-400ms) |
| Dialog / bottom sheet exiting | emphasized-accelerate | short4-medium1 (200-250ms) |
| Card expanding in place | emphasized | medium2-long2 (300-500ms) |
| Page transition | emphasized | medium4-long2 (400-500ms) |

Exits are faster than entrances: users wait for things to appear, not to leave.

## Transition patterns

- **Container transform:** an element grows into its detail view (card → page). Use the View Transitions API (`view-transition-name`) where supported.
- **Shared axis:** forward/back navigation between related screens; content slides along X (or Y) with a fade.
- **Fade through:** switching between unrelated destinations (nav bar tabs); outgoing fades out, incoming fades in with a slight scale from 92%.
- **Fade:** elements appearing within the bounds of the screen (menus, snackbars, dialogs).

## Reduced motion

`assets/theme.css` collapses all transitions and animations under `prefers-reduced-motion: reduce`. For movement that carries meaning, replace it with a fade instead of removing it:

```html
<div class="transition duration-300 ease-emphasized-decelerate motion-safe:translate-y-0 motion-reduce:transition-opacity">...</div>
```

## Examples

Menu enter/exit with `@starting-style` (no JS animation library needed):

```html
<div popover id="menu" class="rounded-corner-extra-small bg-surface-container py-2 shadow-elevation-2
  opacity-0 -translate-y-1 transition-[opacity,translate,display,overlay] transition-discrete duration-100 ease-emphasized-accelerate
  open:opacity-100 open:translate-y-0 open:duration-200 open:ease-emphasized-decelerate
  starting:open:opacity-0 starting:open:-translate-y-1">
  ...
</div>
```

Rules: animate `transform` and `opacity` (cheap, smooth), not `width`/`height`/`top`. Never animate for longer than 1000ms in a UI transition. No motion for decoration alone on every load.
