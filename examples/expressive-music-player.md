# Example: baseline → Expressive

> **Read when:** the user asked for an expressive/playful version and you want to see the levers applied.
> **Contains:** a baseline now-playing card, the same card with each Expressive lever applied, and why each change was made.
> **Not here:** lever definitions and spring values (`references/expressive/expressive.md`).

**Request:** "Make the now-playing card feel more playful and expressive."

Prerequisite: add the Expressive `--radius-corner-*-increased` and `--ease-spring*` tokens from `expressive.md` to the theme.

## Baseline

```html
<article class="flex items-center gap-4 rounded-corner-medium bg-surface-container-highest p-4">
  <img src="cover.jpg" alt="" class="size-14 rounded-corner-small object-cover">
  <div class="min-w-0 flex-1">
    <p class="truncate text-title-medium text-on-surface">Midnight City</p>
    <p class="truncate text-body-medium text-on-surface-variant">M83</p>
  </div>
  <button aria-label="Pause" class="state-layer focus-ring touch-target grid size-10 place-items-center rounded-corner-full text-on-surface-variant">
    <span class="material-symbols-outlined" aria-hidden="true">pause</span>
  </button>
</article>
```

## Expressive

```html
<article class="flex flex-col gap-5 rounded-corner-extra-extra-large bg-primary-container p-5 text-on-primary-container">
  <div class="flex items-center gap-4">
    <img src="cover.jpg" alt="" class="size-20 object-cover [clip-path:url(#scallop)] motion-safe:transition-transform motion-safe:duration-550 motion-safe:ease-spring-slow hover:rotate-6">
    <div class="min-w-0 flex-1">
      <p class="truncate text-headline-small font-medium">Midnight City</p>
      <p class="truncate text-body-large">M83</p>
    </div>
  </div>

  <div class="flex items-center justify-between gap-2 rounded-corner-full bg-surface-container-high p-1 text-on-surface">
    <button aria-label="Previous" class="state-layer focus-ring grid size-14 place-items-center rounded-corner-full transition-[border-radius] duration-350 ease-spring-fast active:rounded-corner-medium">
      <span class="material-symbols-outlined" aria-hidden="true">skip_previous</span>
    </button>
    <button aria-label="Pause" aria-pressed="true" class="state-layer focus-ring grid h-14 flex-1 place-items-center rounded-corner-large bg-primary text-on-primary transition-[border-radius] duration-350 ease-spring-fast active:rounded-corner-small aria-pressed:rounded-corner-large-increased">
      <span class="material-symbols-outlined text-[32px]" aria-hidden="true">pause</span>
    </button>
    <button aria-label="Next" class="state-layer focus-ring grid size-14 place-items-center rounded-corner-full transition-[border-radius] duration-350 ease-spring-fast active:rounded-corner-medium">
      <span class="material-symbols-outlined" aria-hidden="true">skip_next</span>
    </button>
  </div>
</article>
<svg width="0" height="0" aria-hidden="true"><clipPath id="scallop" clipPathUnits="objectBoundingBox"><path d="M.5 0 .6.07.73.04.79.16.92.2.92.33 1 .43.96.56 1 .68.9.77.88.9.75.94.67 1 .55.96.45 1 .33.94.21.94.14.83.04.76.05.63 0 .52.06.4.03.28.13.2.17.08.3.07.4 0Z"/></clipPath></svg>
```

## Lever by lever

| Lever | Change | Why |
|---|---|---|
| Color | Card fill `surface-container-highest` → `primary-container` | The player is this screen's hero; bolder container color makes it the first thing found |
| Size | Play/pause 40px → 56px wide pill; title `title-medium` → `headline-small` | The key action and key info grow one step; secondary actions stay 56px circles |
| Shape | Card 12px → 48px; scalloped cover; pause button squarer than its neighbors | Shape contrast singles out the main control; decorative shape only on the image, never on controls |
| Motion | `ease-spring-fast` on button corners, `ease-spring-slow` on the cover tilt | Spatial springs for shape and rotation; color stays on standard easing |
| Containment | Transport controls grouped in a `surface-container-high` pill | Related controls read as one unit; faster to scan |

Kept from baseline: labels on all icon buttons, standard control order (previous / play / next), contrast pairs (`on-primary-container` on `primary-container`), 48px+ targets, reduced motion.
