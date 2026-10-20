# Naming: M3 token → Tailwind class

> **Read when:** you know the M3 token or concept and need the exact class, or you're reviewing classes for correctness.
> **Contains:** the naming rules, the full lookup table, what was removed and why, extending names.
> **Not here:** what each role means (`foundations/*`).

## The rules

1. **Classes say the M3 role, in full words.** `bg-surface-container-high`, not `bg-sch` or `bg-gray-100`.
2. **Same name in every layer.** M3 token `md.sys.color.on-surface-variant` → CSS variable `--md-sys-color-on-surface-variant` → Tailwind token `--color-on-surface-variant` → class `text-on-surface-variant`. Learn one name, use it everywhere.
3. **No numbers that hide meaning.** No `500`, `xl`, `2xl`. The only numbers are M3's own (elevation level, durations in ms).
4. **Prefixes match the CSS property** (Tailwind's grammar): `bg-` fill, `text-` color or type role, `border-`, `fill-`, `stroke-`, `ring-`, `outline-`, `rounded-`, `shadow-`, `ease-`, `duration-`.

## Lookup table

| M3 concept | M3 token | Tailwind class pattern | Example |
|---|---|---|---|
| Color role | `md.sys.color.<role>` | `bg-<role>`, `text-<role>`, `border-<role>`, `fill-<role>`, `outline-<role>` | `bg-primary-container text-on-primary-container` |
| Color with opacity | role + opacity | `<prefix>-<role>/<percent>` | `bg-on-surface/12`, `bg-scrim/32` |
| Type role | `md.sys.typescale.<role>-<size>` | `text-<role>-<size>` | `text-title-medium` |
| Typeface | `md.ref.typeface.brand` / `.plain` | `font-brand`, `font-plain` | `font-brand text-display-small` |
| Weight | `md.ref.typeface.weight-*` | `font-regular`, `font-medium`, `font-semibold`, `font-bold` | `text-label-large font-semibold` (emphasized label) |
| Shape | `md.sys.shape.corner.<size>` | `rounded-corner-<size>`, `rounded-t-corner-<size>`, `rounded-e-corner-<size>` | `rounded-corner-extra-large` |
| Elevation | `md.sys.elevation.level<n>` | `shadow-elevation-<n>` (level 0 = `shadow-none`) | `shadow-elevation-3` |
| Easing | `md.sys.motion.easing.<name>` | `ease-<name>` | `ease-emphasized-decelerate` |
| Duration | `md.sys.motion.duration.<name>` | `duration-<ms>` | short4 → `duration-200` |
| State layer | `md.sys.state.*-opacity` | `state-layer` utility | `state-layer focus-ring` |
| Focus indicator | focus ring | `focus-ring` utility | |
| Touch target | 48dp minimum | `touch-target` utility | |
| Window size class | compact / medium / expanded / large / extra-large | no prefix, `medium:`, `expanded:`, `large:`, `extra-large:` | `grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3` |
| Spacing | 4dp grid | Tailwind spacing (`p-4` = 16px) | `px-6 py-4` |

Duration mapping: short1 50, short2 100, short3 150, short4 200, medium1 250, medium2 300, medium3 350, medium4 400, long1 450, long2 500, long3 550, long4 600, extra-long1 700, extra-long2 800, extra-long3 900, extra-long4 1000.

## Removed on purpose

`assets/theme.css` resets Tailwind's default colors, font sizes, radii, shadows and breakpoints, so these classes generate **nothing**: `bg-blue-500`, `text-white`, `text-xl`, `rounded-lg`, `shadow-md`, `md:`, `lg:`. A class that silently does nothing is a bug signal: replace it with the M3 equivalent. `transparent` and `current` (`bg-transparent`, `text-current`) still work; they're built in.

If an existing project still needs the defaults, delete the matching `--*-*: initial;` line in the theme, and treat the old classes as findings to migrate.

## Arbitrary values

`bg-[#...]`, `text-[13px]`, `rounded-[10px]`, `shadow-[...]` are off-system. The few legitimate uses:

- Icon glyph size (`text-[18px]`, `text-[20px]`) because icons are not type roles.
- Exact component dimensions from a spec that Tailwind's 4px grid can't express (`w-[360px]` drawer); prefer the spacing scale when it can (`w-90` = 360px).
- `max-w-[65ch]` for line length.

## Google's Tailwind bridge (material-web `labs/gb`)

material-web's experimental bridge (`labs/gb/styles/tailwind.scss`) maps M3 tokens onto Tailwind's own names. A project that uses it already has M3 tokens: keep its class names and don't add `assets/theme.css`. Recognize it by `typescale-*` classes, `--md-sys-space-*` variables or an `@layer md`. Color classes are the same in both. The rest maps like this:

| This skill | Google's bridge |
|---|---|
| `text-body-large` | `typescale-body-lg` (`-sm` / `-md` / `-lg` for every role); emphasized: `typescale-emphasized-body-lg` |
| `rounded-corner-extra-small` / `-small` / `-medium` / `-large` | `rounded-xs` / `-sm` / `-md` / `-lg` |
| `rounded-corner-large-increased` / `-extra-large` / `-extra-large-increased` / `-extra-extra-large` | `rounded-xl` / `-2xl` / `-3xl` / `-4xl` |
| `shadow-elevation-1` … `-5` | `shadow-xs` / `-sm` / `-md` / `-lg` / `-xl` |
| `medium:` / `expanded:` / `large:` / `extra-large:` | `sm:` / `md:` / `lg:` / `xl:` (same 600 / 840 / 1200 / 1600px widths) |
| `p-4` (16px) | `p-4` still works, plus M3 space tokens `p-s200` (16px; `s100` = 8px) |

In these projects, ignore `lint-tokens.mjs` warnings about `rounded-*`, `shadow-*` and `sm:`/`md:`: there the names are M3 tokens.

## Extending

A new role or token follows the same chain. Add `--md-sys-color-success` in `:root` (with `light-dark()`), then `--color-success: var(--md-sys-color-success);` in `@theme inline`, giving `bg-success`, `text-on-success`. A component-level token (rare) uses the component name: `--md-comp-nav-bar-height` → `h-(--md-comp-nav-bar-height)`.
