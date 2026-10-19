# Action components

> **Read when:** building buttons, icon buttons, FABs, chips or segmented buttons, or choosing which button type to use.
> **Contains:** the emphasis ladder, specs, copy-paste recipes with all states, accessibility notes.
> **Not here:** state-layer mechanics (`foundations/state-layers.md`), Expressive button sizes and shape morph (`expressive/expressive.md`).

All dimensions are M3 baseline specs. Every recipe already includes hover, focus, pressed and disabled.

## Which button? (emphasis ladder)

| Emphasis | Type | Use for | Per view |
|---|---|---|---|
| Highest | **FAB** | The single most common creative action of a screen (compose, add) | 0-1 |
| High | **Filled** | Final or primary action: Save, Confirm, Send, Buy | 1 per region |
| Medium-high | **Filled tonal** | Important but not the primary action: Next in a sequence, Add to cart beside Buy | few |
| Medium | **Elevated** | Tonal alternative that must separate from a patterned background | rare |
| Medium | **Outlined** | Secondary actions next to a filled button: Cancel beside Save, Back | few |
| Low | **Text** | Least emphasis: dialog actions, Learn more, inline actions in cards | any |

Order in a row: the primary (highest emphasis) button sits at the **end** (right in LTR): `[Cancel] [Save]`.

## Common button specs

Height 40px · `rounded-corner-full` · `text-label-large` · horizontal padding 24px (`px-6`), 16px on the side with an icon · icon 18px with `gap-2` · min touch target 48px.

```html
<!-- Filled -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center justify-center gap-2 rounded-corner-full bg-primary px-6 text-label-large text-on-primary transition-shadow duration-200 ease-standard hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none">Save</button>

<!-- Filled tonal -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center justify-center gap-2 rounded-corner-full bg-secondary-container px-6 text-label-large text-on-secondary-container transition-shadow duration-200 ease-standard hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none">Next</button>

<!-- Elevated -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center justify-center gap-2 rounded-corner-full bg-surface-container-low px-6 text-label-large text-primary shadow-elevation-1 transition-shadow duration-200 ease-standard hover:shadow-elevation-2 disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none">Add photos</button>

<!-- Outlined -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center justify-center gap-2 rounded-corner-full border border-outline px-6 text-label-large text-primary disabled:border-on-surface/12 disabled:text-on-surface/38">Cancel</button>

<!-- Text -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center justify-center gap-2 rounded-corner-full px-3 text-label-large text-primary disabled:text-on-surface/38">Learn more</button>

<!-- With leading icon: padding 16px on icon side -->
<button class="state-layer focus-ring touch-target inline-flex h-10 items-center gap-2 rounded-corner-full bg-primary ps-4 pe-6 text-label-large text-on-primary">
  <span class="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>New project
</button>
```

A link that looks like a button stays an `<a href>`; a button that navigates nowhere stays a `<button type="button">`.

## Icon buttons

Container 40px, icon 24px, target 48px. Four styles: standard (no container), filled, tonal, outlined. Toggleable icon buttons use `aria-pressed`.

```html
<!-- Standard -->
<button aria-label="Search" class="state-layer focus-ring touch-target grid size-10 place-items-center rounded-corner-full text-on-surface-variant">
  <span class="material-symbols-outlined" aria-hidden="true">search</span>
</button>

<!-- Filled toggle (favorite) -->
<button aria-label="Favorite" aria-pressed="false" class="state-layer focus-ring touch-target grid size-10 place-items-center rounded-corner-full bg-surface-container-highest text-primary aria-pressed:bg-primary aria-pressed:text-on-primary">
  <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
</button>
```

## FAB

| Size | Container | Radius | Icon |
|---|---|---|---|
| Small | 40px | `rounded-corner-medium` | 24px |
| FAB | 56px | `rounded-corner-large` | 24px |
| Large | 96px | `rounded-corner-extra-large` | 36px |
| Extended | height 56px, padding 16px, icon + `text-label-large` | `rounded-corner-large` | 24px |

Colors: default `bg-primary-container text-on-primary-container`; alternatives `secondary-container`, `tertiary-container`, or `surface` (`bg-surface-container-high text-primary`). Elevation 3, hover 4.

```html
<button class="state-layer focus-ring fixed end-4 bottom-24 inline-flex h-14 items-center gap-3 rounded-corner-large bg-primary-container px-4 text-label-large text-on-primary-container shadow-elevation-3 transition-shadow duration-200 ease-standard hover:shadow-elevation-4 medium:bottom-6">
  <span class="material-symbols-outlined" aria-hidden="true">edit</span>Compose
</button>
```

Placement: compact bottom-end above the nav bar (16px margin); medium+ at the top of the navigation rail. One FAB per screen; never for destructive or minor actions.

## Chips

Height 32px · `rounded-corner-small` · `text-label-large` · padding 16px (12px beside an icon) · target 48px via `touch-target`.

| Type | Job | Selected style |
|---|---|---|
| Assist | Smart or suggested action ("Add to calendar") | n/a |
| Filter | Toggle a filter; can be multi-select | `bg-secondary-container text-on-secondary-container`, leading check icon, no border |
| Input | Entered value (recipient, tag), removable | trailing close icon button |
| Suggestion | Suggested reply or query | n/a |

```html
<button aria-pressed="false" class="state-layer focus-ring touch-target inline-flex h-8 items-center gap-2 rounded-corner-small border border-outline-variant px-4 text-label-large text-on-surface-variant aria-pressed:border-transparent aria-pressed:bg-secondary-container aria-pressed:ps-2 aria-pressed:text-on-secondary-container">
  <span class="hidden in-aria-pressed:inline-flex" aria-hidden="true"><span class="material-symbols-outlined text-[18px]">check</span></span>Vegetarian
</button>
```

Group filter chips in a `role="group"` with an `aria-label`; let the row scroll horizontally on compact (`flex gap-2 overflow-x-auto`).

## Segmented button

2-5 options, height 40px, `rounded-corner-full` outer shape, `border-outline`, selected segment `bg-secondary-container` with a check icon. Use for switching views or settings (System / Light / Dark). Implement single-select as a radio group:

```html
<fieldset class="inline-flex">
  <legend class="sr-only">Theme</legend>
  <label class="group state-layer touch-target flex h-10 cursor-pointer items-center gap-2 border border-outline px-4 text-label-large text-on-surface first-of-type:rounded-s-corner-full last-of-type:rounded-e-corner-full not-first-of-type:-ms-px has-checked:bg-secondary-container has-checked:text-on-secondary-container has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-secondary">
    <input type="radio" name="theme" value="system" class="sr-only" checked>
    <span class="hidden group-has-checked:inline-flex" aria-hidden="true"><span class="material-symbols-outlined text-[18px]">check</span></span>System
  </label>
  <label class="group state-layer touch-target flex h-10 cursor-pointer items-center gap-2 border border-outline px-4 text-label-large text-on-surface first-of-type:rounded-s-corner-full last-of-type:rounded-e-corner-full not-first-of-type:-ms-px has-checked:bg-secondary-container has-checked:text-on-secondary-container has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-secondary">
    <input type="radio" name="theme" value="light" class="sr-only">
    <span class="hidden group-has-checked:inline-flex" aria-hidden="true"><span class="material-symbols-outlined text-[18px]">check</span></span>Light
  </label>
  <label class="group state-layer touch-target flex h-10 cursor-pointer items-center gap-2 border border-outline px-4 text-label-large text-on-surface first-of-type:rounded-s-corner-full last-of-type:rounded-e-corner-full not-first-of-type:-ms-px has-checked:bg-secondary-container has-checked:text-on-secondary-container has-focus-visible:z-10 has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-secondary">
    <input type="radio" name="theme" value="dark" class="sr-only">
    <span class="hidden group-has-checked:inline-flex" aria-hidden="true"><span class="material-symbols-outlined text-[18px]">check</span></span>Dark
  </label>
</fieldset>
```

Each segment draws its own 1px border at a full 40px height (shared edges overlap with `-ms-px`), so the 48px `touch-target` isn't clipped. Don't put the border, a fixed height or `overflow-hidden` on the `<fieldset>`: the segments shrink to 38px and the hit area gets cut off. The check icon's visibility toggles on a plain wrapper `<span>`, never on the icon span itself (see the icon rule in `tailwind/setup.md`).

## Rules

- Button labels are verbs in sentence case ("Save draft"), 1-3 words. Never "OK"/"Yes" when a specific verb fits ("Delete", "Discard").
- One filled button per region. Two equal filled buttons compete; demote one.
- Destructive confirmation: text or filled button in the dialog, label names the action ("Delete 3 files"). Use `text-error` only when the action is irreversible and it isn't the default.
- Don't disable a submit button to signal errors; let it submit and show what's wrong (see `ux/forms.md`).
