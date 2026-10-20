# Evals for material-design-web

Two suites. Neither is loaded with the skill; they exist to retest it after edits.

## quality/
11 realistic tasks, run once with the skill and once without.
- 1-8: build, review, fix, expressive, existing design system. Both configurations pass most of these, so they mainly catch regressions.
- 9-11 (`"difficulty": "hard"`): built to tell the configurations apart. `fix-silent-bugs` has two bugs that only show in a browser, `brand-theme` needs a generated M3 scheme (checked by tone, hue and contrast), and `migrate-dashboard` is graded at 390 and 1280px in light and dark.
- `evals.json`: the prompts and expected outcomes. `inputs/`: files the tasks reference. `inputs.sha256`: checks that runs did not modify inputs.
- Run each prompt in a subagent, saving outputs to `iteration-N/<eval-name>/{with_skill,without_skill}/outputs/`, then `node grade.mjs iteration-N [eval-name...]`.
- Checks marked `[browser]` render the output in headless Chrome via `browser.mjs` (no npm install; set `CHROME=<path>` if Chrome isn't found) and run `scripts/audit-page.js` in the page, so contrast, tap targets, names, focus and overflow are measured. A `never loaded: <font>` note means a CDN outage: re-run before trusting that check.

## trigger/
19 queries (12 should load the skill, 7 should not) to test whether the description makes the skill fire on its own.
- One query per subagent, never several in one agent. Fixtures for file-referencing queries: `fixtures/` (and `fixtures-shadcn/` for the shadcn query only).
- Let agents write only to a scratch `out/q<N>/` folder; don't forbid writing files, or build tasks stop before loading any skill.
- Record `{"<query id>": "<agentId>"}` in `runs.json`, then `python -I detect.py <subagent transcript dir>`.
- Baseline (2026-10-19, Haiku 5.5): 7/12 should-trigger fired, 7/7 should-not stayed quiet. `results-2026-10-19.json` has the details.

## Quick start
- Quality: `node evals/quality/grade.mjs evals/quality/iteration-1` (after the runs are saved there).
- One page in the browser: `node evals/quality/browser.mjs <file.html> [width] [dark]`.
- Trigger: `python -I evals/trigger/detect.py <subagent transcript dir>` (after filling `runs.json`).
- Run output (`iteration-*/`, `trigger/out/`, `runs.json`) is git-ignored.
