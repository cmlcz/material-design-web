# Input components

> **Read when:** building text fields, selects, checkboxes, radio buttons, switches or sliders.
> **Contains:** specs, filled vs outlined choice, copy-paste recipes with label, helper, error and disabled states, accessibility wiring.
> **Not here:** form flow, validation timing and error copy (`ux/forms.md`).

## Text fields

Two styles. Pick **one per form**:

- **Filled**: stronger visual emphasis; good for short forms and dialogs. `bg-surface-container-highest`, `rounded-t-corner-extra-small`, 1px bottom indicator `on-surface-variant` → 2px `primary` on focus.
- **Outlined**: lighter; good for long forms and dense layouts. 1px `border-outline`, `rounded-corner-extra-small` → 2px `primary` on focus.

Specs: height 56px · input `text-body-large` `text-on-surface` · label `text-body-large` in the field, `text-body-small` when floated · supporting text `text-body-small` `text-on-surface-variant`, 4px below, 16px start padding · error: indicator/outline, label and supporting text in `error`.

### Outlined (floating label, CSS only)

```html
<div class="w-full max-w-sm">
  <div class="relative">
    <input id="email" name="email" type="email" autocomplete="email" placeholder=" " required aria-describedby="email-help"
      class="peer h-14 w-full rounded-corner-extra-small border border-outline bg-transparent px-4 text-body-large text-on-surface caret-primary outline-none transition-colors duration-150 ease-standard
             hover:border-on-surface focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary
             aria-invalid:border-error aria-invalid:focus:border-error aria-invalid:focus:ring-error
             disabled:border-on-surface/12 disabled:text-on-surface/38">
    <label for="email"
      class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 bg-surface px-1 text-body-large text-on-surface-variant transition-all duration-150 ease-standard
             peer-focus:top-0 peer-focus:text-body-small peer-focus:text-primary
             peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-body-small
             peer-aria-invalid:text-error peer-disabled:text-on-surface/38">Email</label>
  </div>
  <p id="email-help" class="px-4 pt-1 text-body-small text-on-surface-variant">We'll send the receipt here.</p>
</div>
```

The label's `bg-surface` must match the background behind the field (change it if the field sits on a container tier). The focused 2px outline is the 1px border plus a 1px inset ring (`focus:ring-1 focus:ring-inset`), so the text doesn't shift and no arbitrary padding is needed. Error fields add `aria-invalid:focus:ring-error`.

### Filled

```html
<div class="relative">
  <input id="name" type="text" placeholder=" " autocomplete="name"
    class="peer h-14 w-full rounded-t-corner-extra-small border-b border-on-surface-variant bg-surface-container-highest px-4 pt-5 text-body-large text-on-surface caret-primary outline-none
           hover:bg-[color-mix(in_oklab,var(--md-sys-color-on-surface)_8%,var(--md-sys-color-surface-container-highest))]
           focus:border-b-2 focus:border-primary aria-invalid:border-error">
  <label for="name" class="pointer-events-none absolute start-4 top-4 text-body-large text-on-surface-variant transition-all duration-150 ease-standard peer-focus:top-2 peer-focus:text-body-small peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-body-small">Full name</label>
</div>
```

(The hover mix is the state layer for a field, where `::before` can't be used on `<input>`. Wrap in a `<div class="state-layer">` instead if you prefer.)

### Error state

Set `aria-invalid="true"` on the input and swap the helper text for the error message (same `id` stays in `aria-describedby`):

```html
<p id="email-help" class="px-4 pt-1 text-body-small text-error">Enter an email like name@example.com</p>
```

Optional trailing error icon: `<span class="material-symbols-outlined absolute end-3 top-4 text-error" aria-hidden="true">error</span>`.

### Rules for fields

- Always a visible `<label>`. A placeholder is not a label (it disappears and has low contrast).
- Correct `type`, `inputmode` and `autocomplete` on every field (email, tel, one-time-code, street-address).
- Required: mark the optional ones instead if most are required ("Phone (optional)"); otherwise `*` with a legend explaining it.
- Character counter: end of supporting line, `text-body-small text-on-surface-variant`, e.g. "42/100".

## Select / dropdown

Use a native `<select>` styled like an outlined field for simple lists (best accessibility and mobile pickers):

```html
<label for="country" class="mb-1 block px-4 text-body-small text-on-surface-variant">Country</label>
<div class="relative">
  <select id="country" autocomplete="country-name" class="focus-ring h-14 w-full appearance-none rounded-corner-extra-small border border-outline bg-transparent ps-4 pe-12 text-body-large text-on-surface hover:border-on-surface focus:border-2 focus:border-primary">
    <option>Germany</option>
  </select>
  <span class="material-symbols-outlined pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true">arrow_drop_down</span>
</div>
```

For searchable or rich options, use a combobox pattern (input + listbox menu, see `components/overlays.md` for menu styling) following the WAI-ARIA combobox pattern.

## Checkbox

18px box, `rounded-[2px]`, 2px `border-on-surface-variant`; checked `bg-primary` with `on-primary` check; target 48px. Native input + `accent-*` is the most robust:

```html
<label class="inline-flex min-h-12 cursor-pointer items-center gap-3 text-body-large text-on-surface">
  <input type="checkbox" class="focus-ring size-[18px] accent-primary"> Email me product updates
</label>
```

`accent-primary` colors native checkboxes, radios and range sliders with the role. Use custom-drawn boxes only when the design requires the exact M3 visuals.

## Radio buttons

20px, `accent-primary`, grouped in a `<fieldset>` with a `<legend>`. Each row ≥ 48px tall. Use for 2-5 mutually exclusive options visible at once; more options → select.

## Switch

Track 52×32px `rounded-corner-full`; unselected: track `surface-container-highest` with 2px `outline` border, handle 16px `outline`; selected: track `primary`, handle 24px `on-primary`. Use for settings that apply immediately (no Save button).

```html
<label class="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-4">
  <span class="text-body-large text-on-surface">Wi-Fi</span>
  <input type="checkbox" role="switch" class="peer sr-only">
  <span aria-hidden="true" class="relative h-8 w-13 shrink-0 rounded-corner-full border-2 border-outline bg-surface-container-highest transition-colors duration-200 ease-standard
    peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary
    after:absolute after:start-[6px] after:top-1/2 after:size-4 after:-translate-y-1/2 after:rounded-corner-full after:bg-outline after:transition-all after:duration-200 after:ease-standard
    peer-checked:after:start-[22px] peer-checked:after:size-6 peer-checked:after:bg-on-primary"></span>
</label>
```

## Slider

Native `<input type="range" class="w-full accent-primary">` with a visible label and the current value shown (`<output>`). Track 4px (16px in Expressive), handle 20px; step marks for discrete values.

## Rules

- Group related controls with `<fieldset>`/`<legend>`; a single checkbox needs only its label.
- The whole row (label + control) is the target, never just the 18px box.
- Switch = immediate effect; checkbox = choice applied on submit. Don't mix them in one form.
