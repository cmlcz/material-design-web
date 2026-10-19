# Forms

> **Read when:** designing any form, sign-in, checkout, settings page or multi-step flow.
> **Contains:** structure, field choice, validation timing, error message rules, submission behavior, a full example.
> **Not here:** field component styling (`components/inputs.md`).

## Structure

- **Ask less.** Every field costs completion. Remove optional fields that aren't needed now; infer what you can (city from postal code, card type from number).
- **One column.** Multi-column forms cause skipped fields. Exception: short related pairs (first/last name, expiry/CVC) on medium+.
- **Group** related fields under a `<fieldset>` with a `<legend>` (`text-title-medium`), 24-32px between groups, 16-24px between fields.
- **Order** follows the user's mental model (name → email → password), not the database.
- **Long forms** (> ~7 fields): split into steps with a visible progress indicator ("Step 2 of 3"), or sections with headings. Allow going back without losing data.

## Field choice

| Input | Component |
|---|---|
| Free text | Text field with correct `type`/`inputmode`/`autocomplete` |
| 2-5 exclusive options | Radio group (all visible) |
| 6+ exclusive options | Select / combobox |
| Multiple options | Checkboxes or filter chips |
| On/off applied immediately | Switch |
| A date | Text field with format hint + date picker; never three selects |
| A number range | Slider + numeric field for precision |

## Labels and help

- Label above or floating inside (M3 text field); always visible, short, sentence case.
- Helper text below the field for format or constraints **before** the user errs: "At least 8 characters".
- Placeholder only for examples, never as the label.
- Mark the minority: if most fields are required, label the optional ones "(optional)".

## Validation timing

| When | Validate |
|---|---|
| While typing | Never show errors mid-typing. Only positive help (password strength, character count) |
| On blur (leaving a field) | Format errors for that field, once the user has typed something |
| On submit | Everything; move focus to the first invalid field (or an error summary for long forms) |
| After an error is shown | Re-validate on input so the error clears as soon as it's fixed |

Submit buttons stay **enabled**. Disabling them hides why nothing happens; let the submit show the errors.

## Error messages

Formula: **what's wrong + how to fix it**, specific to the field.

| Bad | Good |
|---|---|
| Invalid input | Enter an email like name@example.com |
| Required | Enter your phone number |
| Error | Password needs at least 8 characters |
| Date invalid | Enter a date in the future |

Wire every error to its field: `aria-invalid="true"` + error text referenced by `aria-describedby`. For a summary at the top, use `role="alert"` with links to each field.

## Submission

- Show progress in the button (spinner, `aria-busy`), block double submission.
- On server error, keep all entered data and show the error near the submit button or at the top.
- On success, confirm and say what happens next (redirect, snackbar, success screen).
- `Enter` submits single-line forms; preserve native form behavior with a real `<form>` and `<button type="submit">`.

## Example: sign-in

```html
<form class="mx-auto flex w-full max-w-sm flex-col gap-4 px-4 py-8" novalidate>
  <h1 class="text-headline-small text-on-surface">Sign in</h1>

  <div>
    <div class="relative">
      <input id="si-email" name="email" type="email" autocomplete="username" required placeholder=" " aria-describedby="si-email-msg"
        class="peer h-14 w-full rounded-corner-extra-small border border-outline bg-transparent px-4 text-body-large text-on-surface caret-primary outline-none hover:border-on-surface focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary aria-invalid:border-error aria-invalid:focus:ring-error">
      <label for="si-email" class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 bg-surface px-1 text-body-large text-on-surface-variant transition-all duration-150 ease-standard peer-focus:top-0 peer-focus:text-body-small peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-body-small peer-aria-invalid:text-error">Email</label>
    </div>
    <p id="si-email-msg" class="px-4 pt-1 text-body-small text-on-surface-variant"></p>
  </div>

  <div>
    <div class="relative">
      <input id="si-password" name="password" type="password" autocomplete="current-password" required placeholder=" " aria-describedby="si-password-msg"
        class="peer h-14 w-full rounded-corner-extra-small border border-outline bg-transparent ps-4 pe-12 text-body-large text-on-surface caret-primary outline-none hover:border-on-surface focus:border-primary focus:ring-1 focus:ring-inset focus:ring-primary aria-invalid:border-error aria-invalid:focus:ring-error">
      <label for="si-password" class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 bg-surface px-1 text-body-large text-on-surface-variant transition-all duration-150 ease-standard peer-focus:top-0 peer-focus:text-body-small peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-body-small peer-aria-invalid:text-error">Password</label>
      <button type="button" aria-label="Show password" aria-pressed="false" class="state-layer focus-ring absolute end-1 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-corner-full text-on-surface-variant">
        <span class="material-symbols-outlined" aria-hidden="true">visibility</span>
      </button>
    </div>
    <p id="si-password-msg" class="px-4 pt-1 text-body-small text-on-surface-variant"></p>
  </div>

  <a href="/forgot" class="self-start rounded-corner-extra-small text-label-large text-primary underline-offset-4 hover:underline focus-ring">Forgot password?</a>

  <div class="mt-2 flex justify-end gap-2">
    <a href="/signup" class="state-layer focus-ring inline-flex h-10 items-center rounded-corner-full px-3 text-label-large text-primary">Create account</a>
    <button type="submit" class="state-layer focus-ring inline-flex h-10 items-center rounded-corner-full bg-primary px-6 text-label-large text-on-primary">Sign in</button>
  </div>
</form>
```
