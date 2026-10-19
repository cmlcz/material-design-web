# Content hierarchy and UX copy

> **Read when:** a screen feels flat, cluttered or confusing; there are competing calls to action; or you are writing UI text.
> **Contains:** the hierarchy tools in order of strength, the one-primary-action rule, scanning patterns, cognitive-load checks, UX writing rules.
> **Not here:** type role values (`foundations/typography.md`), color role values (`foundations/color.md`).

## Start from the task

Before styling, answer three questions per screen. If you can't, the hierarchy can't be right:

1. What is the user here to do? (one sentence)
2. What is the **one** primary action?
3. What must they see first, second, third?

Then make the visual weight follow that order.

## Hierarchy tools (strongest first)

1. **Position:** top and start (top-left in LTR) is seen first. Put the primary content there; put the primary action where the eye ends (end of a form, bottom-end FAB).
2. **Size:** type role (display > headline > title > body > label) and element size.
3. **Color emphasis:** accent roles (`primary`) draw attention; `on-surface-variant` recedes.
4. **Containment:** a container tier or card groups and lifts content.
5. **Weight:** `font-medium` for emphasis inside body text, sparingly.
6. **Space:** more space around something = more importance.

Use the fewest tools needed. Everything emphasized means nothing is.

## One primary action per view

- One filled button or FAB per view (or per independent region such as a dialog). Other actions step down the emphasis ladder (`components/actions.md`).
- Destructive actions are never the visual default.
- Hide rare actions in an overflow menu (`more_vert`), not in a row of six buttons.

## Scanning

- People scan in an F-pattern on text-heavy pages: front-load headings and list items with the key word ("Billing: update card" beats "Click here to update your card used for billing").
- Lists and tables: align text to the start; numbers to the end with `tabular-nums`.
- Chunk content into groups of 3-5 with headings. Progressive disclosure: show the essentials, reveal advanced options on demand ("Advanced settings").

## Cognitive load checks

- **Recognition over recall:** show options, recent items and defaults instead of asking users to remember.
- **Consistency:** the same action has the same label, icon and place everywhere.
- **Choice overload:** more than ~7 equally weighted options → group, prioritize or search.
- **Defaults:** pre-select the safe, most common option.

## UX writing

- **Sentence case** everywhere: "Create new project", not "Create New Project" or "CREATE".
- **Buttons are verbs** that say what happens: "Save draft", "Send invite", "Delete account". Avoid "OK", "Submit", "Yes/No".
- **Be specific and short.** "3 files uploaded", not "Your upload operation completed successfully".
- **Talk to the user** ("your files"), active voice, present tense. No blame ("You entered an invalid date" → "Enter a date in the future").
- **Consistent terms:** pick one word per concept (delete vs remove, sign in vs log in) and keep it.
- **Numbers as numerals:** "3 new messages".
- **Links say where they go:** "View billing history", never "click here".

## Before / after

Before: page title in `text-title-medium`, three filled buttons (Export, Share, Edit) of equal weight, metadata in `on-surface`.

After: title in `text-headline-small`; Edit as the one filled button; Share as outlined; Export in the overflow menu; metadata in `text-body-medium text-on-surface-variant`.
