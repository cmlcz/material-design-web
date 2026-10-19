# Review report format

> **Read when:** writing the output of a review (Branch B step 5).
> **Contains:** the exact report template, field definitions, ordering rules, one complete finding as an example.
> **Not here:** what to check (`review/checklist.md`).

## Template

Use this structure exactly. Markdown, in the chat reply (or a file if the user asked for one).

```markdown
# UI review: <screen or component name>

**Scope:** <files / routes / components reviewed>
**Governing system:** <Material 3 | other: name | none>
**Verified in browser:** <yes: tool, widths, themes | no: reason>
**Summary:** <Blocker n · Major n · Minor n · Polish n> — <one sentence: the biggest problem and the biggest win>

## Findings

### [B1] <Severity> · <short title>
- **Location:** <file:line | selector | screenshot ref>
- **Condition:** <what you observed, and when it happens (theme, width, state, input)>
- **Breaks:** <checklist ID + rule, e.g. "B1 Text contrast ≥ 4.5:1 (ux/accessibility.md)">
- **Why it hurts:** <the concrete user impact: who is affected and how>
- **Fix:**
  ```html
  <!-- before -->
  ...
  <!-- after -->
  ...
  ```
- **Verify:** <how to confirm the fix: command, measurement, interaction>

### [B2] ...

## Passed
<checklist IDs that passed, grouped, one line each with evidence>

## Not checked
<checklist IDs not applicable or not verifiable, with reason>

## Next step
Say "apply fixes" (all) or list finding IDs to apply.
```

## Field rules

- **ID** is the checklist ID of the rule broken, plus a suffix when it repeats: `B1`, `B1-2`, `D2`.
- **Severity** from the checklist default, adjusted with a reason when context changes it ("Major → Blocker: this is the only submit button").
- **Condition** is observable and reproducible. Not "colors are bad", but "`.price` text `#9e9e9e` on `#ffffff` = 2.68:1, light theme, all widths".
- **Breaks** names one rule. Several rules broken by one element = several findings, unless one fix solves all (then list all IDs: `B5, D2`).
- **Why it hurts** is about people, not compliance: "Keyboard users can't tell which field is focused and may type into the wrong one."
- **Fix** is a minimal, copy-pasteable diff using this skill's tokens and recipes. One fix per finding. If the fix needs a decision from the user (e.g. which button is primary), say so and give a recommended default.
- **Verify** says how to prove it's fixed.

## Ordering

1. Severity: Blocker → Major → Minor → Polish.
2. Within a severity: accessibility (B) → states and forms (F, G) → components and layout (D, E) → tokens (C) → hierarchy (H).
3. Group duplicates: one finding with a list of locations, not 12 copies.

## Example finding

```markdown
### [B5] Blocker · Focus is invisible on all buttons
- **Location:** `src/components/Button.tsx:14` (`outline-none` on base class), affects every button
- **Condition:** Tabbing through the checkout page shows no focus indication on any button, both themes, all widths.
- **Breaks:** B5 Visible focus on every interactive element (ux/accessibility.md)
- **Why it hurts:** Keyboard and switch users can't see where they are, so they can't complete checkout without guessing.
- **Fix:**
  ```tsx
  // before
  const base = "rounded-full px-6 h-10 outline-none";
  // after
  const base = "state-layer focus-ring rounded-corner-full px-6 h-10 text-label-large";
  ```
- **Verify:** Tab through the page; every button shows a 3px secondary outline with 2px offset.
```

## After the report

Stop. Apply fixes only when the user asks. When they do, apply the requested IDs, re-run the lint and the affected checklist items, and reply with each finding's outcome: fixed / partly fixed (what remains) / skipped (why).
