# Evals for material-design-web

Two suites. Neither is loaded with the skill; they exist to retest it after edits.

## quality/
8 realistic tasks (build, review, fix, expressive, existing design system), run once with the skill and once without.
- `evals.json`: the prompts and expected outcomes. `inputs/`: files the tasks reference. `inputs.sha256`: checks that runs did not modify inputs.
- Run each prompt in a subagent, saving outputs to `iteration-N/<eval-name>/{with_skill,without_skill}/outputs/`, then `node grade.mjs iteration-N`.
- The scripted checks are easy to pass. Also open every built page in a browser: confirm styles compiled (the body background is the M3 surface, `h-12` buttons measure 48px), no horizontal overflow at 390px, and touch targets of 40px or more.

## trigger/
19 queries (12 should load the skill, 7 should not) to test whether the description makes the skill fire on its own.
- One query per subagent, never several in one agent. Fixtures for file-referencing queries: `fixtures/` (and `fixtures-shadcn/` for the shadcn query only).
- Let agents write only to a scratch `out/q<N>/` folder; don't forbid writing files, or build tasks stop before loading any skill.
- Record `{"<query id>": "<agentId>"}` in `runs.json`, then `python -I detect.py <subagent transcript dir>`.
- Baseline (2026-10-19, Haiku 5.5): 7/12 should-trigger fired, 7/7 should-not stayed quiet. `results-2026-10-19.json` has the details.
