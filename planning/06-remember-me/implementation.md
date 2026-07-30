# Remember Me Implementation

## Backend

- Configure the web authentication guard with a 43,200-minute remember duration.
- Use Fortify's native `remember` login field and the existing user
  `remember_token`.
- Keep the existing encrypted, HTTP-only cookie and logout behavior.

## Frontend

- Add an unchecked “Remember me for 30 days” checkbox to the password step.
- Use an explicitly centered flex row with a 1rem checkbox-to-label gap and at
  least 1.25rem before the Log In button.
- Use a white unchecked checkbox surface and the primary green checked state
  with a white checkmark.
- Include the boolean remember value in the typed login request.
- Keep registration credentials separate from login-only fields.

## Verification

- Test remembered and non-remembered Fortify logins and remembered logout.
- Test checkbox visibility, spacing, colors, default state, state retention,
  accessibility, and request data.
- Run backend formatting and tests plus frontend linting, tests, build, and
  Chromium end-to-end coverage.
