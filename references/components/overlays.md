# Overlay components

> **Read when:** building dialogs, bottom sheets, side sheets, menus or tooltips.
> **Contains:** when to use each, specs, native-HTML recipes (`<dialog>`, `popover`), focus and dismissal behavior.
> **Not here:** snackbars and transient feedback (`components/feedback.md`), enter/exit timing (`foundations/motion.md`).

## Which overlay?

| Need | Use |
|---|---|
| Interrupt for a decision or critical info | Basic dialog |
| Complex task on compact screens (form, editor) | Full-screen dialog |
| Secondary content or actions anchored to the bottom (share, filters, details) | Bottom sheet |
| Supplementary content beside main content on expanded+ | Side sheet |
| A list of choices from a trigger | Menu |
| Label for an icon-only control | Plain tooltip |
| Brief contextual explanation with optional action | Rich tooltip |
| Brief feedback after an action | Snackbar (`components/feedback.md`), not a dialog |

Dialogs interrupt. Use them sparingly; never for success messages.

## Basic dialog

Width 280-560px · `rounded-corner-extra-large` · `bg-surface-container-high` · padding 24px · optional hero icon 24px `text-secondary` centered · headline `text-headline-small text-on-surface` · body `text-body-medium text-on-surface-variant` · actions end-aligned text buttons, 8px apart, 24px above · scrim `bg-scrim/32`.

```html
<dialog id="confirm-delete" aria-labelledby="cd-title" aria-describedby="cd-body"
  class="m-auto w-[min(560px,calc(100vw-48px))] min-w-[280px] rounded-corner-extra-large bg-surface-container-high p-6 text-on-surface shadow-elevation-3 backdrop:bg-scrim/32
         opacity-0 scale-95 transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-emphasized-accelerate
         open:opacity-100 open:scale-100 open:duration-300 open:ease-emphasized-decelerate starting:open:opacity-0 starting:open:scale-95">
  <h2 id="cd-title" class="text-headline-small">Delete 3 photos?</h2>
  <p id="cd-body" class="mt-4 text-body-medium text-on-surface-variant">They'll be removed from all your devices. This can't be undone.</p>
  <form method="dialog" class="mt-6 flex justify-end gap-2">
    <button value="cancel" class="state-layer focus-ring touch-target h-10 rounded-corner-full px-3 text-label-large text-primary">Cancel</button>
    <button value="delete" class="state-layer focus-ring touch-target h-10 rounded-corner-full px-3 text-label-large text-primary">Delete</button>
  </form>
</dialog>
<script>document.getElementById("confirm-delete").showModal();</script>
```

`showModal()` gives focus trapping, Esc to close, inert background and top-layer stacking for free. Return focus to the trigger on close (the browser does this for `<dialog>`).

Rules: title states the question or action; body explains consequences; action labels are verbs matching the title ("Delete", not "OK"); the confirming action is last. Scrim click dismisses non-critical dialogs only.

## Full-screen dialog (compact)

`rounded-corner-none`, `bg-surface`, top app bar with close icon (leading) and a text "Save" action (trailing). On medium+ show the same content as a basic dialog instead.

## Bottom sheet

- **Modal**: `bg-surface-container-low`, `rounded-t-corner-extra-large`, elevation 1, over `bg-scrim/32`, max width 640px centered on wide screens, drag handle 32×4px `bg-on-surface-variant/40` `rounded-corner-full` 22px from top. Dismiss: scrim tap, Esc, swipe down, or explicit close.
- **Standard**: no scrim, coexists with content (e.g. a map's details).

```html
<dialog id="share" class="mx-auto mt-auto mb-0 w-full max-w-[640px] rounded-t-corner-extra-large bg-surface-container-low px-4 pb-6 text-on-surface shadow-elevation-1 backdrop:bg-scrim/32
  translate-y-full transition-[translate,display,overlay] transition-discrete duration-250 ease-emphasized-accelerate
  open:translate-y-0 open:duration-400 open:ease-emphasized-decelerate starting:open:translate-y-full">
  <div class="mx-auto mt-5.5 mb-4 h-1 w-8 rounded-corner-full bg-on-surface-variant/40" aria-hidden="true"></div>
  <h2 class="text-title-large">Share</h2>
  ...
</dialog>
```

## Side sheet

Expanded+: `bg-surface` standard side sheet beside content (`w-90`, divider `border-s border-outline-variant`), or modal with `bg-surface-container-low`, `rounded-s-corner-large`, scrim. Header: `text-title-large` + close icon button.

## Menu

`bg-surface-container` · `rounded-corner-extra-small` · elevation 2 · vertical padding 8px · min width 112px, max 280px · item height 48px, padding 12px, `text-label-large text-on-surface`, optional leading/trailing 24px icons `text-on-surface-variant`, trailing keyboard shortcut `text-label-large text-on-surface-variant` · divider `border-outline-variant` with 8px vertical margin.

```html
<button popovertarget="row-menu" aria-label="More options" class="state-layer focus-ring touch-target grid size-10 place-items-center rounded-corner-full text-on-surface-variant">
  <span class="material-symbols-outlined" aria-hidden="true">more_vert</span>
</button>
<div id="row-menu" popover role="menu" class="m-0 min-w-28 max-w-70 rounded-corner-extra-small bg-surface-container py-2 shadow-elevation-2 [position-area:bottom_span-left] [position-try-fallbacks:flip-block]">
  <button role="menuitem" class="state-layer flex h-12 w-full items-center gap-3 px-3 text-start text-label-large text-on-surface focus-visible:outline-none focus-visible:before:opacity-12">
    <span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">edit</span>Rename
  </button>
  <hr class="my-2 border-outline-variant">
  <button role="menuitem" class="state-layer flex h-12 w-full items-center gap-3 px-3 text-start text-label-large text-on-surface">
    <span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">delete</span>Delete
  </button>
</div>
```

`popover` handles light dismiss and Esc. For full keyboard support (arrow keys, Home/End, typeahead) follow the WAI-ARIA menu button pattern. CSS anchor positioning (`position-area`) is new; fall back to JS positioning (Floating UI) where unsupported.

## Tooltips

- **Plain**: `bg-inverse-surface text-inverse-on-surface text-body-small`, `rounded-corner-extra-small`, height 24px, padding 8px, appears on hover **and** focus after ~500ms, never contains interactive content. The trigger gets `aria-describedby` (or the tooltip text is its `aria-label`).
- **Rich**: `bg-surface-container`, `rounded-corner-medium`, elevation 2, optional title `text-title-small`, body `text-body-medium text-on-surface-variant`, optional text button. Opens on click or focus; behaves like a non-modal popover.

```html
<button aria-describedby="tip-archive" class="group state-layer focus-ring touch-target relative grid size-10 place-items-center rounded-corner-full text-on-surface-variant">
  <span class="material-symbols-outlined" aria-hidden="true">archive</span><span class="sr-only">Archive</span>
  <span id="tip-archive" role="tooltip" class="pointer-events-none absolute top-full mt-1 rounded-corner-extra-small bg-inverse-surface px-2 py-1 text-body-small whitespace-nowrap text-inverse-on-surface opacity-0 transition-opacity delay-500 duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">Archive</span>
</button>
```
