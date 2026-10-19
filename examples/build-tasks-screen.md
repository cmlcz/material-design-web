# Example: building a screen (Branch A)

> **Read when:** you want to see Branch A end to end before building your own screen.
> **Contains:** the framing notes, the complete single-file page (responsive nav, list, FAB, empty/loading/error states, snackbar, dark mode), and the self-check.
> **Not here:** the rules behind each choice (linked inline).

**Request:** "Build a task list screen for a small productivity web app."

## 1. Frame

- Task: see today's tasks and tick them off. Primary action: add a task (FAB). Content: a list of tasks.
- States: loading (skeleton), empty (first use), error (retry), ideal, success (snackbar with Undo after completing).
- Widths: compact (nav bar, single list), medium (nav rail), expanded (rail + list-detail second pane placeholder).

## 2-5. The page

Single file for demonstration (CDN Tailwind; in a real project, import `assets/theme.css` instead of pasting it).

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tasks</title>
  <script>try{const t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch{}</script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
    /* paste assets/theme.css here */
  </style>
</head>
<body class="min-h-dvh">
  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-corner-full focus:bg-primary focus:px-6 focus:py-2 focus:text-label-large focus:text-on-primary">Skip to content</a>

  <!-- Navigation rail: medium and up -->
  <nav aria-label="Main" class="fixed inset-y-0 start-0 z-10 hidden w-20 flex-col items-center gap-3 bg-surface py-6 medium:flex">
    <button id="fab-rail" class="state-layer focus-ring mb-6 grid size-14 place-items-center rounded-corner-large bg-primary-container text-on-primary-container shadow-elevation-3 transition-shadow duration-200 ease-standard hover:shadow-elevation-4" aria-label="Add task">
      <span class="material-symbols-outlined" aria-hidden="true">add</span>
    </button>
    <a href="#" aria-current="page" class="group focus-ring flex w-14 flex-col items-center gap-1 rounded-corner-medium text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface">
      <span class="state-layer grid h-8 w-14 place-items-center rounded-corner-full group-aria-[current=page]:bg-secondary-container group-aria-[current=page]:text-on-secondary-container">
        <span class="material-symbols-outlined group-aria-[current=page]:[font-variation-settings:'FILL'_1]" aria-hidden="true">today</span>
      </span>Today
    </a>
    <a href="#" class="group focus-ring flex w-14 flex-col items-center gap-1 rounded-corner-medium text-label-medium text-on-surface-variant">
      <span class="state-layer grid h-8 w-14 place-items-center rounded-corner-full"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span></span>Upcoming
    </a>
    <a href="#" class="group focus-ring flex w-14 flex-col items-center gap-1 rounded-corner-medium text-label-medium text-on-surface-variant">
      <span class="state-layer grid h-8 w-14 place-items-center rounded-corner-full"><span class="material-symbols-outlined" aria-hidden="true">folder</span></span>Projects
    </a>
  </nav>

  <div class="pb-20 medium:ps-20 medium:pb-0">
    <header class="sticky top-0 z-[5] flex h-16 items-center gap-1 bg-surface px-4 text-on-surface medium:px-6">
      <h1 class="flex-1 truncate text-title-large">Today</h1>
      <button id="theme-toggle" aria-label="Switch theme" class="state-layer focus-ring touch-target grid size-10 place-items-center rounded-corner-full text-on-surface-variant">
        <span class="material-symbols-outlined" aria-hidden="true">dark_mode</span>
      </button>
    </header>

    <main id="main" class="grid gap-6 px-4 medium:px-6 expanded:grid-cols-[minmax(320px,2fr)_3fr]">
      <section aria-labelledby="list-title" class="min-w-0">
        <h2 id="list-title" class="px-4 pt-2 pb-2 text-title-small text-on-surface-variant">3 tasks · 1 done</h2>

        <!-- Ideal state -->
        <ul id="list" role="list" class="overflow-hidden rounded-corner-large bg-surface-container-low">
          <li>
            <label class="state-layer flex min-h-[72px] cursor-pointer items-center gap-4 px-4 py-2">
              <input type="checkbox" class="focus-ring size-[18px] shrink-0 accent-primary">
              <span class="min-w-0 flex-1">
                <span class="block truncate text-body-large text-on-surface">Send invoice to Northwind</span>
                <span class="block truncate text-body-medium text-on-surface-variant">Finance · due 17:00</span>
              </span>
            </label>
          </li>
          <li class="border-t border-outline-variant">
            <label class="state-layer flex min-h-[72px] cursor-pointer items-center gap-4 px-4 py-2">
              <input type="checkbox" class="focus-ring size-[18px] shrink-0 accent-primary">
              <span class="min-w-0 flex-1">
                <span class="block truncate text-body-large text-on-surface">Review onboarding copy</span>
                <span class="block truncate text-body-medium text-on-surface-variant">Website</span>
              </span>
            </label>
          </li>
          <li class="border-t border-outline-variant">
            <label class="state-layer flex min-h-[72px] cursor-pointer items-center gap-4 px-4 py-2">
              <input type="checkbox" checked class="peer focus-ring size-[18px] shrink-0 accent-primary">
              <span class="min-w-0 flex-1 peer-checked:[&>span:first-child]:line-through">
                <span class="block truncate text-body-large text-on-surface-variant">Book dentist</span>
                <span class="block truncate text-body-medium text-on-surface-variant">Personal</span>
              </span>
            </label>
          </li>
        </ul>

        <!-- Loading state (show while fetching) -->
        <div id="loading" hidden role="status" aria-label="Loading tasks" class="space-y-4 rounded-corner-large bg-surface-container-low p-4">
          <div class="flex items-center gap-4 motion-safe:animate-pulse" aria-hidden="true">
            <div class="size-[18px] rounded-[2px] bg-surface-container-highest"></div>
            <div class="flex-1 space-y-2"><div class="h-4 w-2/3 rounded-corner-extra-small bg-surface-container-highest"></div><div class="h-3 w-1/3 rounded-corner-extra-small bg-surface-container-high"></div></div>
          </div>
        </div>

        <!-- Empty state (first use) -->
        <div id="empty" hidden class="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 py-12 text-center">
          <span class="material-symbols-outlined text-[48px] text-on-surface-variant" aria-hidden="true">task_alt</span>
          <h3 class="text-title-large text-on-surface">No tasks for today</h3>
          <p class="text-body-medium text-on-surface-variant">Add what you want to get done, and tick it off here.</p>
          <button class="state-layer focus-ring h-10 rounded-corner-full bg-primary px-6 text-label-large text-on-primary">Add task</button>
        </div>

        <!-- Error state -->
        <div id="error" hidden role="alert" class="flex items-start gap-3 rounded-corner-medium bg-error-container p-4 text-on-error-container">
          <span class="material-symbols-outlined" aria-hidden="true">cloud_off</span>
          <div class="flex-1"><p class="text-title-small">Couldn't load tasks</p><p class="text-body-medium">Check your connection and try again.</p></div>
          <button class="state-layer focus-ring h-10 rounded-corner-full px-3 text-label-large">Retry</button>
        </div>
      </section>

      <!-- Expanded: detail pane -->
      <section aria-label="Task details" class="hidden rounded-corner-large bg-surface-container p-6 expanded:block">
        <p class="text-body-medium text-on-surface-variant">Select a task to see its details.</p>
      </section>
    </main>
  </div>

  <!-- FAB: compact only (rail has its own) -->
  <button id="fab" class="state-layer focus-ring fixed end-4 bottom-24 z-10 grid size-14 place-items-center rounded-corner-large bg-primary-container text-on-primary-container shadow-elevation-3 transition-shadow duration-200 ease-standard hover:shadow-elevation-4 medium:hidden" aria-label="Add task">
    <span class="material-symbols-outlined" aria-hidden="true">add</span>
  </button>

  <!-- Navigation bar: compact only -->
  <nav aria-label="Main" class="fixed inset-x-0 bottom-0 z-10 flex h-20 bg-surface-container medium:hidden">
    <a href="#" aria-current="page" class="group focus-ring flex flex-1 flex-col items-center justify-center gap-1 text-label-medium text-on-surface-variant aria-[current=page]:text-on-surface">
      <span class="state-layer grid h-8 w-16 place-items-center rounded-corner-full group-aria-[current=page]:bg-secondary-container group-aria-[current=page]:text-on-secondary-container">
        <span class="material-symbols-outlined group-aria-[current=page]:[font-variation-settings:'FILL'_1]" aria-hidden="true">today</span>
      </span>Today
    </a>
    <a href="#" class="group focus-ring flex flex-1 flex-col items-center justify-center gap-1 text-label-medium text-on-surface-variant">
      <span class="state-layer grid h-8 w-16 place-items-center rounded-corner-full"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span></span>Upcoming
    </a>
    <a href="#" class="group focus-ring flex flex-1 flex-col items-center justify-center gap-1 text-label-medium text-on-surface-variant">
      <span class="state-layer grid h-8 w-16 place-items-center rounded-corner-full"><span class="material-symbols-outlined" aria-hidden="true">folder</span></span>Projects
    </a>
  </nav>

  <!-- Snackbar live region (present from load) -->
  <div aria-live="polite" class="pointer-events-none fixed inset-x-4 bottom-24 z-20 flex justify-center medium:bottom-6">
    <div id="snackbar" hidden role="status" class="pointer-events-auto flex min-h-12 w-full items-center gap-2 rounded-corner-extra-small bg-inverse-surface ps-4 pe-2 text-inverse-on-surface shadow-elevation-3 medium:w-auto medium:min-w-[344px]">
      <p class="flex-1 py-3 text-body-medium">Task completed</p>
      <button class="state-layer focus-ring h-10 rounded-corner-full px-3 text-label-large text-inverse-primary">Undo</button>
    </div>
  </div>

  <script>
    const root = document.documentElement;
    document.getElementById("theme-toggle").addEventListener("click", () => {
      const dark = root.dataset.theme === "dark" || (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
      root.dataset.theme = dark ? "light" : "dark";
      try { localStorage.setItem("theme", root.dataset.theme); } catch {}
    });
    let timer;
    document.getElementById("list").addEventListener("change", (e) => {
      if (!e.target.checked) return;
      const bar = document.getElementById("snackbar");
      bar.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(() => (bar.hidden = true), 6000);
    });
  </script>
</body>
</html>
```

Choices, with the rule behind each:

- Rail on medium+, bar on compact, same destinations ([navigation-patterns](../references/layout/navigation-patterns.md)).
- List in `surface-container-low` on a `surface` page: tonal separation, no shadow ([elevation](../references/foundations/elevation.md)).
- One FAB as the single primary action; rail hosts it on medium+ ([actions](../references/components/actions.md)).
- Whole row is the checkbox's label, so the target is 72px tall ([inputs](../references/components/inputs.md)).
- Completing a task is reversible: snackbar with Undo, not a confirm dialog ([states](../references/ux/states.md)).
- No `dark:` classes anywhere; the theme toggle flips `data-theme` ([dark mode](../references/tailwind/dark-mode-and-brand-color.md)).

## 6. Self-check (abridged)

| Check | Result | Evidence |
|---|---|---|
| C1 tokens only | pass | `lint-tokens.mjs` → 0 errors |
| B3 targets | pass | rows 72px, icon button 40px + `touch-target` |
| B5 focus | pass | `focus-ring` on every control |
| F1-F3 states | pass | loading / empty / error blocks present |
| E1 responsive | pass | screenshots at 412, 700, 1280 |
| C7 dark | pass | toggle + screenshot in dark |
