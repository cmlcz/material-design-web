# Navigation components

> **Read when:** building a top app bar, navigation bar, navigation rail, navigation drawer, tabs or search bar.
> **Contains:** specs and copy-paste recipes for each, active-state wiring, accessibility.
> **Not here:** which component to use at which width (`layout/navigation-patterns.md`).

## Top app bar

| Variant | Height | Title | Use |
|---|---|---|---|
| Small | 64px | `text-title-large` | Default |
| Center-aligned | 64px | `text-title-large`, centered | Main root screen with one title |
| Medium | 112px | `text-headline-small`, second row | Screens needing a longer or prominent title |
| Large | 152px | `text-headline-medium`, second row | Top of a hierarchy, high emphasis |

`bg-surface` at rest; on scroll `bg-surface-container` (tone change, no shadow). Leading: nav icon (menu/back); trailing: up to 3 action icon buttons, more in an overflow menu.

```html
<header class="sticky top-0 z-10 flex h-16 items-center gap-1 bg-surface px-1 text-on-surface transition-colors duration-200 ease-standard data-[scrolled=true]:bg-surface-container">
  <button aria-label="Back" class="state-layer focus-ring touch-target grid size-12 place-items-center rounded-corner-full">
    <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
  </button>
  <h1 class="flex-1 truncate px-1 text-title-large">Settings</h1>
  <button aria-label="Search settings" class="state-layer focus-ring grid size-12 place-items-center rounded-corner-full text-on-surface-variant">
    <span class="material-symbols-outlined" aria-hidden="true">search</span>
  </button>
</header>
```

Set `data-scrolled` from a tiny `scroll` listener or an IntersectionObserver on a sentinel.

## Navigation bar (compact)

Height 80px · `bg-surface-container` · 3-5 destinations · each item: icon 24px in an active indicator (64×32px, `rounded-corner-full`, `bg-secondary-container`), label `text-label-medium` 4px below · active icon filled, label `text-on-surface`, inactive `text-on-surface-variant`.

```html
<nav aria-label="Main" class="fixed inset-x-0 bottom-0 z-10 flex h-20 bg-surface-container pb-[env(safe-area-inset-bottom)] medium:hidden">
  <a href="/" aria-current="page" class="group focus-ring flex flex-1 flex-col items-center justify-center gap-1 text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface">
    <span class="state-layer grid h-8 w-16 place-items-center rounded-corner-full group-aria-[current=page]:bg-secondary-container group-aria-[current=page]:text-on-secondary-container">
      <span class="material-symbols-outlined group-aria-[current=page]:[font-variation-settings:'FILL'_1]" aria-hidden="true">home</span>
    </span>
    Home
  </a>
  <!-- 2-4 more items -->
</nav>
```

## Navigation rail (medium, expanded)

Width 80px · `bg-surface` · items stacked, 12px apart, starting below an optional menu button and FAB · indicator 56×32px · label `text-label-medium` below the icon.

```html
<nav aria-label="Main" class="fixed inset-y-0 start-0 hidden w-20 flex-col items-center gap-3 bg-surface py-11 medium:flex">
  <button class="state-layer focus-ring mb-4 grid size-14 place-items-center rounded-corner-large bg-primary-container text-on-primary-container shadow-elevation-3" aria-label="Compose">
    <span class="material-symbols-outlined" aria-hidden="true">edit</span>
  </button>
  <a href="/" aria-current="page" class="group focus-ring flex w-14 flex-col items-center gap-1 rounded-corner-medium text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface">
    <span class="state-layer grid h-8 w-14 place-items-center rounded-corner-full group-aria-[current=page]:bg-secondary-container group-aria-[current=page]:text-on-secondary-container">
      <span class="material-symbols-outlined" aria-hidden="true">inbox</span>
    </span>
    Inbox
  </a>
</nav>
```

## Navigation drawer

Width 360px max (`w-90`) · padding 12px · item height 56px, `rounded-corner-full`, `text-label-large`, icon 24px + 12px gap · active `bg-secondary-container text-on-secondary-container` · section headers `text-title-small text-on-surface-variant`, dividers between sections.

- **Standard** (persistent, large+): `bg-surface`, sits beside content.
- **Modal** (compact/medium, or when space is tight): `bg-surface-container-low`, `rounded-e-corner-large`, over a `bg-scrim/32` scrim, elevation 1; use `<dialog>` for focus trapping and Esc to close.

```html
<dialog id="drawer" class="m-0 h-dvh max-h-none w-[min(360px,85vw)] rounded-e-corner-large bg-surface-container-low p-3 text-on-surface shadow-elevation-1 backdrop:bg-scrim/32">
  <nav aria-label="Main">
    <p class="px-4 py-4 text-title-small text-on-surface-variant">Mail</p>
    <a href="/inbox" aria-current="page" class="state-layer focus-ring flex h-14 items-center gap-3 rounded-corner-full px-4 text-label-large text-on-surface-variant aria-[current=page]:bg-secondary-container aria-[current=page]:text-on-secondary-container">
      <span class="material-symbols-outlined" aria-hidden="true">inbox</span><span class="flex-1">Inbox</span><span>24</span>
    </a>
  </nav>
</dialog>
```

## Tabs

Primary tabs (top of content, below app bar): height 48px (64px with icon + label), label `text-title-small`, active `text-primary` with a 3px `bg-primary` indicator (`rounded-t-[3px]`, width of the label), inactive `text-on-surface-variant`. Secondary tabs (within content): 2px full-width indicator, active label `text-on-surface`.

Use the WAI-ARIA tabs pattern: `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"`, arrow-key navigation, only the active tab in the tab order (`tabindex="-1"` on others).

```html
<div role="tablist" aria-label="Trip sections" class="flex border-b border-outline-variant bg-surface">
  <button role="tab" aria-selected="true" aria-controls="p-overview" id="t-overview" class="state-layer focus-ring relative h-12 flex-1 text-title-small text-on-surface-variant aria-selected:text-primary">
    Overview
    <span class="absolute inset-x-6 bottom-0 hidden h-0.75 rounded-t-corner-full bg-primary in-aria-selected:block"></span>
  </button>
  <button role="tab" aria-selected="false" aria-controls="p-photos" id="t-photos" tabindex="-1" class="state-layer focus-ring relative h-12 flex-1 text-title-small text-on-surface-variant aria-selected:text-primary">Photos</button>
</div>
```

## Search bar

Height 56px · `rounded-corner-full` · `bg-surface-container-high` · leading search icon (or nav icon), `text-body-large` input with placeholder hint, trailing avatar or mic icon. Expands to a full-screen search view on compact, or a docked dropdown (`rounded-corner-extra-large`) on larger screens.

```html
<form role="search" class="flex h-14 items-center gap-1 rounded-corner-full bg-surface-container-high px-1 has-focus-visible:outline-3 has-focus-visible:outline-secondary">
  <span class="grid size-12 place-items-center text-on-surface" aria-hidden="true"><span class="material-symbols-outlined">search</span></span>
  <label for="q" class="sr-only">Search mail</label>
  <input id="q" type="search" placeholder="Search mail" class="h-full flex-1 bg-transparent text-body-large text-on-surface outline-none placeholder:text-on-surface-variant">
</form>
```
