---
name: material-design-web
description: >-
  Material Design 3 web UI kit for Tailwind CSS v4 - a tested M3 token theme, component recipes, UX rules, a
  review checklist and a lint script that catches silent rendering bugs. Use this skill whenever you are about
  to build, restyle, fix or review the front-end of a web page or web app (HTML, React, Vue, Svelte with
  Tailwind) that has no other design system: landing pages, sign-up and login forms, settings screens,
  dashboards, data tables, navigation, dialogs, form validation and error states, dark mode, design tokens,
  brand colors. Always use it when a request mentions Material, M3, Material You or Material 3 Expressive, asks
  for a bold, playful or expressive UI, or asks about UX, visual hierarchy, clutter, accessibility, contrast or
  touch targets of web UI ("what's off UX-wise", "looks cluttered", "audit this component"). Load it before
  reading the user's files. Not for native Android or iOS (Jetpack Compose, SwiftUI), projects styled with
  Bootstrap, shadcn/ui, MUI or Chakra, or non-UI code.
---

# Material Design 3 for the web (Tailwind v4)

Material 3 (M3) is a system of **roles**, not colors: every surface, text and shape answers "what job does this do?" and gets the token for that job. Work token-first: semantic HTML, Tailwind utilities generated from M3 tokens, no raw values.

## Step 0: Gate (always)

Decide which system governs this UI before writing a line:

- **Existing design system** (its own tokens, a component library such as shadcn/ui, Bootstrap, Chakra, a brand kit): that system wins. Use only the system-agnostic UX references (`references/ux/`, `references/layout/`) and say so.
- **Material project, Material requested, or nothing in place**: continue with this skill.
- **Expressive** (playful, bold, energetic, "Material 3 Expressive"): only when the user asks. Then also read `references/expressive/expressive.md`.

## Step 1: Load what the task needs

Read files just in time. Each file starts with "Read when / Contains / Not here" so you can confirm you have the right one.

| You need to... | Read |
|---|---|
| Install Tailwind v4 or add the M3 theme | `references/tailwind/setup.md`, then copy `assets/theme.css` |
| Know which class to write for a token | `references/tailwind/naming.md` |
| Handle light/dark or a brand color | `references/tailwind/dark-mode-and-brand-color.md` |
| Pick color roles (surface, container, on-*) | `references/foundations/color.md` |
| Pick a type role | `references/foundations/typography.md` |
| Pick corner radius / elevation | `references/foundations/shape.md`, `references/foundations/elevation.md` |
| Add hover/focus/pressed/disabled feedback | `references/foundations/state-layers.md` |
| Animate anything | `references/foundations/motion.md` |
| Lay out a page across screen widths | `references/layout/window-size-classes.md` |
| Choose bar, rail or drawer navigation | `references/layout/navigation-patterns.md` |
| Set spacing, padding, density | `references/layout/spacing-density.md` |
| Build buttons, FABs, icon buttons, chips, segmented buttons | `references/components/actions.md` |
| Build text fields, checkboxes, radios, switches, selects | `references/components/inputs.md` |
| Build cards, lists, dividers | `references/components/cards-lists.md` |
| Build app bars, nav bar, rail, drawer, tabs, search | `references/components/navigation.md` |
| Build dialogs, sheets, menus, tooltips | `references/components/overlays.md` |
| Build snackbars, progress, badges | `references/components/feedback.md` |
| Design loading / empty / error / success states | `references/ux/states.md` |
| Design a form flow and validation | `references/ux/forms.md` |
| Fix weak hierarchy, too many CTAs, UX copy | `references/ux/content-hierarchy.md` |
| Meet accessibility requirements | `references/ux/accessibility.md` |
| Review an existing UI | `references/review/checklist.md`, `references/review/report-format.md` |
| Check the result in a browser | `references/review/browser-verification.md` |
| See a complete worked example | `examples/` (build, review, expressive) |

## Branch A: Build new UI

1. **Frame the screen.** Name the user's primary task, the one primary action, and the content. List the states it must show (loading, empty, error, success, disabled). Pick the window size classes it must support (default: compact, medium, expanded).
2. **Set up tokens.** If the project lacks them, add `assets/theme.css` (see `tailwind/setup.md`). Reuse existing M3 tokens if present; never fork a second token set.
3. **Lay out.** Choose navigation and pane layout per window size class (`layout/`). Mobile-first: write the compact layout, then add `medium:` / `expanded:` variants.
4. **Compose components.** Use the component file's anatomy and class recipe. Semantic elements first (`<button>`, `<a>`, `<label>`, `<dialog>`, `<nav>`), ARIA only to fill gaps.
5. **Write every state.** Each interactive element: hover, focus-visible, pressed, disabled. Each data view: loading, empty, error.
6. **Verify.** Run `lint-tokens.mjs` on your output and fix every **error**. Two of its errors (`tw-browser-import`, `icon-display`) catch pages that look broken in the browser yet raise no console error, so without a browser the lint is your only check for them. Then run the review checklist against your output (Branch B, steps 2-4, without the report) and fix every failure. Then run browser verification if a browser tool exists.

## Branch B: Review and fix existing UI

1. **Scope.** Identify files, routes or components in scope and which system governs them (Step 0).
2. **Scan mechanically.** Run `node <skill-dir>/scripts/lint-tokens.mjs <paths>` to find raw colors, off-scale values, default-palette classes and `dark:` overrides. Read the hits; the script is a lead, not a verdict.
3. **Audit by checklist.** Walk `references/review/checklist.md` section by section, in order. Every item gets pass / fail / not applicable, with evidence.
4. **Look at it.** If a browser tool exists, follow `review/browser-verification.md` (screenshots per width and theme, `scripts/audit-page.js` for contrast and target size).
5. **Report.** Use the exact format in `references/review/report-format.md`: findings ordered by severity, each with condition, rule broken, why it hurts, and a fix snippet.
6. **Fix only when asked.** Hand over the report and stop. Apply fixes only when the user says so; then re-run steps 2-4 on the changed files.

## Core rules (apply everywhere)

- **Roles over values.** `bg-primary text-on-primary`, never `bg-[#6750a4]` or `bg-purple-600`. Every container role is paired with its `on-` role for content.
- **Surfaces are tonal.** Separate regions with `surface-container-*` tiers first; shadows are for things that float (menus, FABs, dragged items).
- **Type from the scale.** Only the 15 type roles (`text-body-large`, `text-title-medium`...). Hierarchy comes from role choice, not ad-hoc sizes.
- **Shape from the scale.** `rounded-corner-*` only.
- **One emphasis peak per view.** At most one filled button or FAB as the primary action; the rest step down (tonal, outlined, text).
- **Theme through variables.** Light/dark swap the role variables; components carry no `dark:` classes.
- **Accessible by construction.** 48×48px targets, 4.5:1 text contrast, 3:1 for icons and boundaries, visible focus, `prefers-reduced-motion` honored.

## Done criteria

The work is finished only when **every applicable item in `references/review/checklist.md` passes**, including: tokens only (lint clean), contrast, touch targets, all interactive and data states present, keyboard and focus, responsive at compact / medium / expanded, light and dark. If a browser tool is available, done also requires having looked at the screenshots. State in your final message which checks were verified in a browser and which were checked by reading code.
