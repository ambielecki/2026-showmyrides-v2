# Session Authentication Implementation

## Summary

Implement Laravel Fortify and Sanctum session authentication for the Vue SPA, including
registration, two-step login, logout, current-user hydration, guarded routes, responsive
navigation, and local API diagnostics.

## Backend

- Configure Fortify as a headless API with only registration enabled.
- Enable Sanctum stateful API middleware and credentialed CORS for the local frontend.
- Return JSON errors for API and authentication requests.
- Expose a redacted current-user resource and local-only public and protected diagnostic
  endpoints.
- Keep frontend-created users non-administrators.

## Frontend

- Add a typed native Fetch service with Sanctum CSRF and normalized error handling.
- Add a Pinia auth store for hydration, registration, login, and logout.
- Implement accessible registration and two-step login forms.
- Guard guest, authenticated, and administrator routes in the router.
- Connect desktop and mobile navigation to real auth state.
- Add a development-only API diagnostic page.

## Verification

- Add Pest coverage for auth, current-user serialization, diagnostic routes, and CORS.
- Add Vitest coverage for the HTTP service, auth store, forms, guards, and navigation.
- Add mocked Playwright coverage plus a local integration flow using the test credentials
  from `backend/.env` without exposing them.
- Run backend tests and Pint in the deploy container.
- Run frontend unit tests, linting, build/type-checking, and Chromium Playwright.
