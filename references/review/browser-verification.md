# Browser verification

> **Read when:** finishing a build or a review and any browser tool is available, or the user asks to see it rendered.
> **Contains:** how to detect the available browser tool, the tool-agnostic procedure, a tool-name mapping, how to run `scripts/audit-page.js`, what to look for in screenshots.
> **Not here:** the checks themselves (`review/checklist.md`).

## 1. Detect a browser tool

Look at your available tools and use the first that exists:

| Tool family | Recognize by | Navigate | Resize | Screenshot | Run JS |
|---|---|---|---|---|---|
| Playwright MCP | `browser_navigate` | `browser_navigate` | `browser_resize` | `browser_take_screenshot` | `browser_evaluate` |
| Chrome DevTools MCP | `navigate_page`, `take_screenshot` | `navigate_page` / `new_page` | `resize_page` or `emulate` | `take_screenshot` | `evaluate_script` (+ `lighthouse_audit` for a11y) |
| agent-browser MCP | `agent_browser_*` | `agent_browser_open` | (viewport via `agent_browser_eval` or profile) | `agent_browser_screenshot` | `agent_browser_eval` |
| Claude in Chrome / built-in browser | their skill names | read that skill first | | | |
| CLI Playwright | `npx playwright` available | script | script | script | script |

If none exists, say "not verified in a browser" in the final message and rely on code reading plus `lint-tokens.mjs`. Don't install a browser without asking.

Many tools are deferred: load their schemas first (for example with a tool search for `browser_navigate`).

## 2. Serve the page

Browser tools usually can't open `file://` paths reliably. Serve the folder:

```bash
npx --yes serve -l 4173 <folder>          # or
python -m http.server 4173 -d <folder>
```

Or use the project's dev server (`npm run dev`) and its URL. Run servers in the background and stop them when done.

## 3. Procedure

For each width × theme:

| Width class | Viewport |
|---|---|
| Compact | 412 × 915 |
| Medium | 700 × 1000 |
| Expanded | 1280 × 800 |

1. Navigate; wait for load.
2. Theme: light first, then set dark with JS: `document.documentElement.dataset.theme = "dark"` (or emulate `prefers-color-scheme: dark` if the tool supports it).
3. Screenshot (full page for long pages).
4. Run `scripts/audit-page.js` (below) once per theme at compact and expanded.
5. Keyboard: press Tab several times and screenshot once to confirm the focus ring.
6. Exercise states you built: open the dialog/menu, trigger a form error, show the empty state (via a query param or toggling data in JS).

## 4. Run the audit script

Read `scripts/audit-page.js` and pass its full contents (comment header included) to the tool's JS evaluation. The file is one arrow function returning a JSON report:

- Function-style tools (Playwright `browser_evaluate` `function` param, Chrome DevTools `evaluate_script`): pass the contents as-is.
- Expression-style tools (`agent_browser_eval`, a console): wrap it as `(<contents>)()`.

It reports:

- `contrast`: text elements below 4.5:1 (3:1 for large text), with colors and ratio
- `targets`: interactive elements smaller than 48×48px (counting `touch-target` expansion) and below 24×24px
- `names`: interactive elements with no accessible name
- `labels`: form fields without a label
- `focus`: interactive elements whose focus style removes the outline with no replacement (heuristic)
- `summary`: counts

Treat results as leads: verify each before reporting (e.g. contrast over images and gradients can't be computed and is listed as `unknown`).

## 5. What to look for in screenshots

- Compact: nothing cut off or overlapping; no horizontal scroll; nav bar at the bottom; FAB clear of the nav bar; touch targets look comfortably sized.
- Medium/expanded: layout reveals more (rail, second pane, more columns) rather than stretching; reading width bounded.
- Dark: no white flashes, no hard-coded light surfaces, no invisible text or icons, outlines visible.
- Hierarchy: one thing clearly draws the eye first; it's the primary content or action.
- Focus: ring clearly visible on the focused element.

Look at every screenshot you take, and mention concrete observations in your report ("expanded: list-detail shows both panes; dark: snackbar uses inverse surface correctly").
