# Feedback components

> **Read when:** showing the result of an action or ongoing work: snackbars, progress indicators, badges, banners.
> **Contains:** specs, recipes, live-region wiring, timing rules.
> **Not here:** full-page loading, empty and error states (`ux/states.md`), dialogs (`components/overlays.md`).

## Snackbar

Brief message about an app process, at the bottom of the screen. `bg-inverse-surface` · `text-inverse-on-surface text-body-medium` · action `text-inverse-primary text-label-large` · `rounded-corner-extra-small` · elevation 3 · min height 48px · padding 16px start · width: full minus 16px margins on compact, 344-672px on medium+ · above the nav bar / FAB.

- One snackbar at a time. A new one replaces the old.
- Duration 4-10s; no auto-dismiss if it has an action users must be able to reach (or ≥10s), and pause the timer on hover/focus.
- At most one action ("Undo", "Retry"); optional close icon for long durations.
- Never for critical errors that need a decision (use a dialog) or persistent issues (use a banner).

```html
<div aria-live="polite" class="pointer-events-none fixed inset-x-4 bottom-24 z-20 flex justify-center medium:bottom-6">
  <div role="status" class="pointer-events-auto flex min-h-12 w-full items-center gap-2 rounded-corner-extra-small bg-inverse-surface ps-4 pe-2 text-inverse-on-surface shadow-elevation-3 medium:w-auto medium:min-w-[344px] medium:max-w-[672px]">
    <p class="flex-1 py-3 text-body-medium">Message archived</p>
    <button class="state-layer focus-ring h-10 rounded-corner-full px-3 text-label-large text-inverse-primary">Undo</button>
  </div>
</div>
```

Keep the `aria-live` container in the DOM from page load and inject the message into it, so screen readers announce it.

## Progress indicators

| Type | Determinate | Indeterminate |
|---|---|---|
| Linear | Known % (upload, multi-step) | Unknown duration at top of a region |
| Circular | Known % in a compact spot | Loading a card, a button, a refresh |

Linear: track 4px `rounded-corner-full` `bg-secondary-container`, indicator `bg-primary`. Circular: 48px (or 40px), 4px stroke `stroke-primary`, track `stroke-secondary-container`.

```html
<!-- Determinate linear -->
<div role="progressbar" aria-label="Uploading report.pdf" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60"
     class="h-1 w-full overflow-hidden rounded-corner-full bg-secondary-container">
  <div class="h-full rounded-corner-full bg-primary transition-[width] duration-300 ease-standard" style="width:60%"></div>
</div>

<!-- Indeterminate circular -->
<svg role="progressbar" aria-label="Loading messages" class="size-12 animate-spin" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="20" fill="none" stroke-width="4" class="stroke-secondary-container"/>
  <circle cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="90 200" class="stroke-primary"/>
</svg>
```

Timing: show nothing for operations under ~1s (a flash of spinner reads as jank); indeterminate 1-10s; determinate with a label (and time remaining if possible) beyond 10s. Prefer skeletons for content loading (see `ux/states.md`).

## Badges

- Small: 6px dot, `bg-error`, `rounded-corner-full`, on the icon's top-end. Means "new", no count.
- Large: height 16px, min width 16px, padding 4px, `bg-error text-on-error text-label-small`, `rounded-corner-full`. Max "999+".

```html
<span class="relative">
  <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
  <span class="absolute -end-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-corner-full bg-error px-1 text-label-small text-on-error">3</span>
</span>
<span class="sr-only">Notifications, 3 unread</span>
```

The count must be in the accessible name of the control, not only in the visual badge.

## Banners (inline messages)

For persistent, important messages tied to a region (offline, account issue): full-width, `bg-secondary-container text-on-secondary-container` (info) or `bg-error-container text-on-error-container` (problem), `rounded-corner-medium` when inset, leading icon, 1-2 text buttons. They stay until resolved or dismissed. `role="status"` for info, `role="alert"` only for urgent errors.
