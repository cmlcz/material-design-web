# Review checklist

> **Read when:** reviewing existing UI (Branch B), or verifying your own build before calling it done (Branch A).
> **Contains:** every check, grouped and ordered, each with an ID, how to verify it, and its default severity.
> **Not here:** how to write the findings (`review/report-format.md`), browser procedure (`review/browser-verification.md`).

Walk the sections **in order**. Mark every item **pass**, **fail** or **n/a** with one line of evidence (file:line, selector, screenshot, script output). An item you didn't check is not a pass. Severity in brackets is the default; raise or lower it with a stated reason.

Severity scale: **Blocker** (someone can't complete the task or access content) · **Major** (task is harder, error-prone, or the system is clearly broken) · **Minor** (inconsistency, polish affecting perception) · **Polish** (nice to have).

## A. Gate

- **A1** Governing system identified (M3, other system, none). If another system governs, only sections E-H apply. [—]

## B. Accessibility (always first)

- **B1** Text contrast ≥ 4.5:1 (≥ 3:1 for `headline-small`+), both themes. Verify: `audit-page.js` or pair check (X / on-X). [Blocker]
- **B2** Non-text contrast ≥ 3:1 for meaningful icons, field boundaries, focus ring. [Major]
- **B3** Touch targets ≥ 48×48px (or `touch-target`), ≥ 8px apart. Verify: `audit-page.js` target report. [Major; Blocker below 24px]
- **B4** Every interactive element keyboard reachable and operable; logical tab order. [Blocker]
- **B5** Visible focus on every interactive element (`focus-ring` or equivalent); no bare `outline-none`. [Blocker]
- **B6** Semantic elements: buttons are `<button>`, links `<a href>`, fields have `<label>`, landmarks present, headings in order. [Major; Blocker for unlabeled fields / div-buttons]
- **B7** Accessible names for icon-only controls; decorative icons `aria-hidden`; images have appropriate `alt`. [Major]
- **B8** Color isn't the only signal (errors, selection, links). [Major]
- **B9** Dynamic messages announced (`aria-live`, `role="alert"`, `aria-invalid` + `aria-describedby`). [Major]
- **B10** Reduced motion honored; no flashing. [Minor; Blocker for flashing]
- **B11** Reflow: usable at 320px wide and 200% zoom; no horizontal scroll. [Major]

## C. Tokens and theme

- **C1** Colors only from roles (no hex, `rgb()`, default palette, arbitrary color). Verify: `lint-tokens.mjs`. [Major]
- **C2** Role pairs respected (content on X uses on-X or a sanctioned accent). [Major]
- **C3** Type only from the 15 roles; no off-scale sizes or ad-hoc weight/leading overrides. [Minor]
- **C4** Corners only from the shape scale, and matched to component size. [Minor]
- **C5** Elevation: tonal tiers for structure; shadows only on floating/moving elements, from `shadow-elevation-*`. [Minor]
- **C6** Spacing on the 4px grid (Tailwind scale), no arbitrary paddings/margins. [Minor]
- **C7** Dark theme works with no component-level `dark:` classes; both themes checked. [Major]
- **C8** One token source (single theme file); no duplicated or forked token sets. [Minor]

## D. Components

- **D1** Each component matches its M3 anatomy and specs (height, padding, radius, type role) from `components/*`. [Minor]
- **D2** Every interactive element has hover, focus-visible, pressed and disabled states (`state-layer`, disabled = on-surface 12% / 38%). [Major]
- **D3** Right component for the job (snackbar vs dialog, switch vs checkbox, chips vs buttons, list vs cards). [Major]
- **D4** Emphasis ladder: ≤ 1 filled button / FAB per view or region; primary action at the end of a button row. [Major]
- **D5** Selected/active states use `secondary-container` + `aria-current`/`aria-selected`/`aria-pressed`. [Minor]
- **D6** Overlays: dialogs use `<dialog>` + `showModal()`, Esc closes, focus returns; menus dismiss on outside click and Esc. [Major]

## E. Layout and navigation

- **E1** Responsive at compact (≤ 599), medium (600-839), expanded (≥ 840): layout reveals panes/columns, doesn't just stretch. [Major]
- **E2** Navigation component matches window size class (bar / rail / drawer); same destinations everywhere. [Major]
- **E3** Margins 16px compact, 24px medium+; pane gap 24px; reading width ≤ ~65ch. [Minor]
- **E4** Grouping by proximity: space inside groups < space between groups. [Minor]
- **E5** Navigation: 3-5 bar destinations, icon + label, actions not mixed with destinations. [Major]

## F. States

- **F1** Loading state for every async region (skeleton/progress per duration rules), no layout jump. [Major]
- **F2** Empty state per type (first use, no results, cleared) with a next step. [Major]
- **F3** Error states: plain-language message + recovery, placed where the problem is, user data kept. [Major]
- **F4** Success/confirmation: undo snackbar for reversible actions, confirm dialog for irreversible ones. [Minor]
- **F5** Disabled controls explain why (or aren't disabled). [Minor]

## G. Forms (if any)

- **G1** Visible label per field; placeholder not used as label. [Blocker]
- **G2** Correct `type`, `inputmode`, `autocomplete`. [Minor]
- **G3** Validation timing: on blur/submit, not while typing; errors clear on fix; focus moves to first error on submit. [Major]
- **G4** Error messages say what's wrong and how to fix; wired with `aria-invalid` + `aria-describedby`. [Major]
- **G5** Submit stays enabled; shows progress; prevents double submission; keeps data on failure. [Major]

## H. Hierarchy and content

- **H1** One clear primary action; visual order matches task priority. [Major]
- **H2** Type hierarchy skips levels; secondary info in `on-surface-variant`. [Minor]
- **H3** UX copy: sentence case, verb buttons, specific errors, consistent terms. [Minor]

## I. Verification evidence

- **I1** Lint (`scripts/lint-tokens.mjs`) run on changed files: clean or every hit justified. [—]
- **I2** If a browser tool exists: screenshots at compact / medium / expanded, light and dark, inspected; `audit-page.js` run. If none exists: say so in the final message. [—]

## Expressive (only when in scope)

Add the checks in `expressive/expressive.md` → "Expressive review checks".
