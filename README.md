# material-design-web

A Claude Code skill for building and reviewing web UIs with Material Design 3 and Tailwind CSS v4.

## What's inside

- `SKILL.md`: skill entry point and instructions
- `assets/theme.css`: tested M3 token theme
- `references/`: foundations, components, layout, UX rules, Tailwind setup and review checklist
- `examples/`: sample build and review walkthroughs
- `scripts/`: `lint-tokens.mjs` catches silent rendering bugs, `audit-page.js` audits a page
- `evals/`: trigger and quality tests

## Install

Clone into your Claude Code skills folder:

```sh
git clone https://github.com/cmlcz/material-design-web ~/.claude/skills/material-design-web
```

## Usage

Claude loads the skill automatically when you ask it to build, restyle or review a web UI, or mention Material, M3 or Material You.

Not for native Android/iOS, or projects styled with Bootstrap, shadcn/ui, MUI or Chakra.
