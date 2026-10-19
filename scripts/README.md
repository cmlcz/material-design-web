# Scripts

Run with Node 18+. Every finding is a lead to check, not a verdict.

- `lint-tokens.mjs`: `node scripts/lint-tokens.mjs <file-or-dir> [--json]` flags styling that bypasses the M3 tokens (exit 1 on errors).
- `contrast-check.mjs`: `node scripts/contrast-check.mjs [theme.css] [--json]` checks WCAG contrast of the theme's role pairs in light and dark (exit 1 on failures).
- `audit-page.js`: paste into a browser tool's "evaluate JS" call to audit contrast, touch targets, names, labels and focus on a live page.
