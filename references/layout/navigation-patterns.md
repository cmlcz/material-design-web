# Navigation patterns

> **Read when:** deciding how users move between top-level destinations.
> **Contains:** which navigation component per window size class, the responsive swap recipe, rules for destinations and actions.
> **Not here:** component anatomy and classes (`components/navigation.md`).

## Choose by window size class

| Class | Primary navigation | Notes |
|---|---|---|
| Compact | Navigation bar (bottom), 3-5 destinations | Or a modal drawer if more than 5 destinations |
| Medium | Navigation rail (start edge) | FAB sits at the top of the rail |
| Expanded | Navigation rail, or standard drawer | Drawer when destinations need labels and grouping |
| Large / extra-large | Standard (persistent) navigation drawer | Rail is fine for apps with few destinations |

Top app bar is for the **current screen's** title and actions, not for top-level navigation. Tabs navigate between **sibling views within one destination**, not between destinations.

## Responsive swap recipe

One `<nav>` per pattern, shown at its class:

```html
<!-- Rail: medium and up -->
<nav aria-label="Main" class="fixed inset-y-0 start-0 hidden w-20 flex-col items-center gap-3 bg-surface pt-11 medium:flex">...</nav>

<!-- Bar: compact only -->
<nav aria-label="Main" class="fixed inset-x-0 bottom-0 flex h-20 bg-surface-container medium:hidden">...</nav>

<!-- Content offsets -->
<main class="pb-20 medium:ps-20 medium:pb-0">...</main>
```

Keep the same destinations, order, icons and labels across all patterns, so users don't relearn the app when they resize or rotate.

## Rules

- **Destinations: 3-5 in a nav bar, 3-7 in a rail**, any number in a drawer (group with section headers).
- **Every destination has an icon and a label** in bar and rail. Icon-only navigation tests poorly; labels can be hidden only in a rail by explicit choice, never in a bar.
- **Active destination**: pill indicator in `secondary-container`, filled icon, `aria-current="page"`.
- **Actions are not destinations.** "Create", "Share", "Log out" don't belong in the nav bar. Creation goes in a FAB; account actions go in the top app bar or a menu.
- Preserve scroll position and state per destination when switching.
- On compact, hide the nav bar only on immersive screens (full-screen media, composing), and restore it on back.
