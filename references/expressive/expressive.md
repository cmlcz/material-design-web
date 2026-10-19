# Material 3 Expressive

> **Read when:** the user asks for a more expressive, playful, bold, energetic or "M3 Expressive" feel. Not otherwise: baseline M3 is the default.
> **Contains:** what Expressive is and what the research found, the five levers with web tactics, spring motion as CSS, shape tokens and morphing, expressive component patterns, limits, an example.
> **Not here:** baseline tokens and components (everything else in `references/`). Expressive builds on them; it doesn't replace them.

## Source confidence

- **Verified** (Google's research article, design.google): the five levers (color, shape, size, motion, containment), the research findings and limits below.
- **Reported** (Material 3 Expressive release, May 2025, Android/Compose implementation): spring motion scheme values, extra shape tokens, new components. Values are marked *(reported)*; use them, but say so if the user needs spec-exact output.
- `@material/web` will **not** implement Expressive (maintainers, May 2025). Everything here is hand-built with Tailwind.

## What it is

Expressive is M3 turned up for emotion and clarity: bolder color, varied shape, larger key actions, springy motion and stronger containment. Google tested it in 46 studies with 18,000+ participants:

- Key UI elements were found **up to 4× faster**; tap times on key actions dropped.
- Preferred across all age groups; users 45+ located key elements as fast as younger users.
- Larger buttons and high-contrast containment improved usability for varied motor and visual abilities.

**Limits found by the same research** (treat as rules):

- Breaking established patterns hurt usability (unlabeled icon actions, unusual layouts scored lower). Keep familiar structure; express through styling.
- A strong minority prefers calmer UI. Expressive is not right for every product (dense data tools, enterprise admin, legal/medical forms).
- Expressiveness never costs function or accessibility.

## Set the intensity first

Match the dial to the request and audience before picking tactics. The lever rules below describe **medium**; scale them.

| Intensity | When | What changes |
|---|---|---|
| Low | "a bit livelier", productivity apps, settings | Springs on key interactions, one bigger primary action. Nothing else. |
| Medium | "expressive", "M3 Expressive", consumer apps | All five levers as written below. |
| High | "bold", "playful", "fun", kids, onboarding, games, marketing, celebration moments | Every view has a hero: `text-display-*` at an emphasized weight in `font-brand`, which you may swap for a rounded display face (Fredoka, Nunito, Baloo 2). Choice tiles rotate through `primary-` / `secondary-` / `tertiary-container`, not one gray tier. Large decorative shapes sit behind content. The primary action steps up two sizes (M → L). Selection morphs shape **and** scales, with `ease-spring-fast`. |

High intensity still keeps role pairs, contrast, 48px targets, labels, and reduced motion. If the result could pass for a calm baseline screen, the dial is set too low for a "bold and fun" request.

## The five levers (web tactics)

### 1. Color: bolder, purposeful

- Fill key actions and hero areas with **container roles at larger scale**: a hero band in `bg-primary-container`, a highlight card in `bg-tertiary-container`.
- Use `tertiary` deliberately as the contrast accent for one special element per view.
- Generate the scheme with the **Expressive or Vibrant variant** (`tailwind/dark-mode-and-brand-color.md`) for higher chroma.
- Still role-pairs only; contrast rules unchanged.

### 2. Shape: variety and contrast

Extra corner tokens *(reported)*; add to `@theme` when using Expressive:

```css
@theme {
  --radius-corner-large-increased: 20px;
  --radius-corner-extra-large-increased: 32px;
  --radius-corner-extra-extra-large: 48px;
}
```

- **Contrast shapes:** pair a fully round element with a square-ish one (round FAB on a 28px card), or mix corner sizes inside a group.
- **Shape as state:** a selected or pressed element changes shape (round → squarer). Pressed buttons squish their corners:

```html
<button class="state-layer focus-ring h-14 rounded-corner-full bg-primary px-6 text-title-medium text-on-primary transition-[border-radius] duration-200 ease-spring-fast active:rounded-corner-medium aria-pressed:rounded-corner-large">Play</button>
```

- **Decorative shapes** (scalloped, clover, burst, "cookie" polygons from the M3 shape library) for avatars, image masks and empty-state art via `clip-path` or SVG masks. Keep them out of controls that need a recognizable affordance.

### 3. Size: make the key action bigger

- The primary action of a view gets **one size step up**: a 56px button instead of 40px, a large FAB.
- Button sizes *(reported)*: XS 32px, S 40px (baseline), M 56px, L 96px, XL 136px heights. Labels scale with them (`text-label-large` → `text-title-medium` → `text-headline-small` → `text-headline-large`).
- Hero type: `text-display-*` for one key number or phrase; emphasized weights (`font-medium`/`font-bold` on display and headline) *(reported "emphasized" type styles)*.

### 4. Motion: springs

Expressive replaces duration+easing with **springs**. Two kinds *(reported, Compose `MotionScheme`)*:

- **Spatial** springs move position, size, rotation, shape; may overshoot.
- **Effects** springs change color and opacity; never overshoot (use baseline `ease-standard` with short durations).

CSS approximation with `linear()` (computed from the spring equations; add to `@theme`):

```css
@theme {
  /* spatial default: damping 0.8, stiffness 380 → ~410ms, 1.4% overshoot */
  --ease-spring: linear(0, 0.054, 0.166, 0.303, 0.443, 0.572, 0.683, 0.776, 0.849, 0.904, 0.945, 0.973, 0.993, 1.004, 1.011, 1.013, 1.014, 1.013, 1.011, 1.009, 1.007, 1.006, 1.004, 1.003, 1);
  /* spatial fast: damping 0.6, stiffness 800 → ~340ms, 9% overshoot (bouncy) */
  --ease-spring-fast: linear(0, 0.081, 0.259, 0.455, 0.644, 0.815, 0.936, 1.018, 1.069, 1.089, 1.090, 1.079, 1.062, 1.044, 1.026, 1.013, 1.003, 0.996, 0.993, 0.992, 0.992, 0.993, 0.995, 0.997, 1);
  /* spatial slow: damping 0.8, stiffness 200 → ~560ms (large surfaces) */
  --ease-spring-slow: linear(0, 0.054, 0.164, 0.303, 0.44, 0.572, 0.682, 0.777, 0.849, 0.905, 0.945, 0.974, 0.993, 1.005, 1.011, 1.014, 1.014, 1.013, 1.012, 1.01, 1.008, 1.006, 1.004, 1.003, 1);
}
```

Pair each with its natural duration: `ease-spring duration-400`, `ease-spring-fast duration-350`, `ease-spring-slow duration-550`. Use fast for small elements (buttons, chips, toggles), default for cards and sheets, slow for full-screen surfaces. Reduced motion still collapses them (handled in `assets/theme.css`).

### 5. Containment: group with strong tiers

- Group related controls in a visible container (`bg-surface-container-high rounded-corner-extra-large p-2`) instead of loose rows.
- Increase tier contrast between regions; use larger corner radii on containers.
- **Button groups** *(reported component)*: connected buttons in one container, the selected one changes shape and color:

```html
<div role="group" aria-label="Text alignment" class="inline-flex gap-0.5 rounded-corner-full bg-surface-container-high p-1">
  <button aria-pressed="true" class="state-layer focus-ring h-10 rounded-corner-full px-4 text-label-large text-on-surface-variant transition-[border-radius,background-color] duration-350 ease-spring-fast aria-pressed:bg-secondary-container aria-pressed:text-on-secondary-container">Left</button>
  <button aria-pressed="false" class="state-layer focus-ring h-10 rounded-corner-small px-4 text-label-large text-on-surface-variant transition-[border-radius,background-color] duration-350 ease-spring-fast aria-pressed:rounded-corner-full aria-pressed:bg-secondary-container aria-pressed:text-on-secondary-container">Center</button>
</div>
```

## Expressive components *(reported)*

Build these with baseline tokens plus the levers above:

| Component | Web pattern |
|---|---|
| Button group / connected buttons | Above; segmented control with shape-changing selection |
| Split button | Primary action + attached menu trigger, inner corners smaller (`rounded-s-corner-full rounded-e-corner-extra-small` + mirror) |
| FAB menu | FAB that expands into a stack of 2-6 labeled tonal actions, FAB morphs to a close icon |
| Floating toolbar | `bg-surface-container-high rounded-corner-full shadow-elevation-3` bar of icon buttons floating above content, bottom center |
| Loading indicator | A morphing shape (polygon ↔ circle) for 1-5s waits, replacing a small circular spinner; respect reduced motion |
| Wavy progress | Linear/circular progress with a wave in the active track (SVG path); keep the baseline track for determinate values |
| Flexible nav bar | Shorter bar (64px), labels beside icons on medium widths |

## Expressive review checks

Add to the normal checklist when Expressive is in scope:

- Only the key action(s) are scaled up; secondary actions keep baseline size.
- Shape changes communicate state or grouping, not random decoration.
- Patterns stay familiar: labels on icon actions, standard navigation placement.
- Springs on spatial properties only; color/opacity use standard easing.
- Contrast and target sizes still pass; overshoot never moves a target under the pointer.
- A calm version is achievable by removing the levers, not by rebuilding.

## Example

See `examples/expressive-music-player.md` for a baseline screen turned expressive, lever by lever.
