# UI states

> **Read when:** any view shows data, runs async work, or can fail; or when a review finds only the "happy path" designed.
> **Contains:** the state inventory, what each state must contain, loading strategy by duration, empty-state types, error recovery, recipes.
> **Not here:** interaction states of single controls (`foundations/state-layers.md`), progress component specs (`components/feedback.md`).

## The inventory

Every view that shows data has **at least five states**. Design each one; an undesigned state ships as a blank screen or a raw error.

| State | When | Must contain |
|---|---|---|
| **Loading** | Data requested, not yet here | Skeleton or progress in the shape of what's coming; layout doesn't jump when data arrives |
| **Empty** | Request succeeded, nothing to show | Why it's empty + the next step (primary action) |
| **Ideal** | Data present | The designed content |
| **Partial** | Some data, some missing or still loading | Show what exists, mark what's pending |
| **Error** | Request failed | What happened in plain words + how to recover (Retry, check connection, contact) |

Plus where relevant: **offline**, **permission denied**, **success/confirmation**, **too much data** (pagination, truncation), **disabled** (with a reason).

## Loading

| Expected wait | Show |
|---|---|
| < 1s | Nothing (avoid flashing a spinner); keep the previous content |
| 1-3s | Skeleton for content regions; indeterminate circular in buttons/small areas |
| 3-10s | Skeleton + text if it runs long ("Still loading..."); keep the UI usable |
| > 10s | Determinate progress with label and, if possible, time remaining; allow cancel or background |

Skeleton recipe (matches final layout, pulses gently, silent for screen readers with a single status):

```html
<div role="status" aria-label="Loading messages" class="space-y-2 p-4">
  <div class="flex items-center gap-4 motion-safe:animate-pulse" aria-hidden="true">
    <div class="size-10 rounded-corner-full bg-surface-container-highest"></div>
    <div class="flex-1 space-y-2">
      <div class="h-4 w-1/3 rounded-corner-extra-small bg-surface-container-highest"></div>
      <div class="h-3 w-2/3 rounded-corner-extra-small bg-surface-container-high"></div>
    </div>
  </div>
</div>
```

Buttons that trigger async work: keep the button's width, swap the label for a small spinner or append it, set `aria-busy="true"`, and prevent double submission.

## Empty states

Three different situations, three different messages:

1. **First use** ("You don't have any projects yet"): explain the value, offer the primary action ("Create project"). Optional illustration (`text-on-surface-variant`, ≤ 120px on compact).
2. **No results** ("No results for 'tokio'"): echo the query, suggest fixes (check spelling, remove filters) and offer "Clear filters".
3. **Cleared / done** ("You're all caught up"): positive confirmation, no action needed.

```html
<section class="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 py-12 text-center">
  <span class="material-symbols-outlined text-[48px] text-on-surface-variant" aria-hidden="true">folder_open</span>
  <h2 class="text-title-large text-on-surface">No projects yet</h2>
  <p class="text-body-medium text-on-surface-variant">Projects keep your files, tasks and people in one place.</p>
  <button class="state-layer focus-ring h-10 rounded-corner-full bg-primary px-6 text-label-large text-on-primary">Create project</button>
</section>
```

## Errors

- **Say what happened and what to do**, in the user's words. "We couldn't load your messages. Check your connection and try again." Not "Error 500" or "Something went wrong" alone.
- **Keep the user's work.** Never clear a form or a draft on error.
- **Place errors where the problem is:** field errors under the field (`ux/forms.md`), region errors inside the region, app-level errors in a banner. A page-level error replaces only the region that failed, not the whole app shell.
- **Offer recovery:** Retry (primary), alternative path (secondary), and support contact for repeated failures.
- **Error is not the only color signal:** icon + text, `role="alert"` for errors that appear after an action.

```html
<div role="alert" class="flex items-start gap-3 rounded-corner-medium bg-error-container p-4 text-on-error-container">
  <span class="material-symbols-outlined" aria-hidden="true">cloud_off</span>
  <div class="flex-1">
    <p class="text-title-small">Couldn't load messages</p>
    <p class="text-body-medium">Check your connection and try again.</p>
  </div>
  <button class="state-layer focus-ring h-10 rounded-corner-full px-3 text-label-large">Retry</button>
</div>
```

## Success and confirmation

- Reversible actions: act immediately + snackbar with "Undo" (better than a confirmation dialog).
- Irreversible or high-cost actions: confirm first with a dialog that names the consequence.
- After a long flow (checkout, signup): a success screen with what happens next.

## Optimistic UI

For fast, likely-successful actions (like, archive, toggle), update the UI immediately, send the request, and roll back with a snackbar explanation on failure.
