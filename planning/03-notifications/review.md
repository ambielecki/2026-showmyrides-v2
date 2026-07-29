# PR review: notifications

Reviewed PR #3, `03-notifications` into `main`.

## Required changes

- Resolved: the error-state icon used the same "X" shape as the dismiss button, which
  made the two meanings difficult to distinguish. The error-state icon now uses a
  circled exclamation while the dismiss button retains the "X".

The implementation matches the planning document: alerts use a shared typed Pinia store, render through a single app-level host, support success/warning/error states with visible labels and semantic daisyUI alert colors, stack newest-first, support manual dismissal, and pause the 20-second timer during hover, keyboard focus, and hidden document state.

No required changes remain.

## Notes

- The temporary `/test/notifications` route is intentionally public but unlinked, matching the plan. Remove it in the later cleanup task before this stops being a manual-test surface.
- The review focused on the notification surface and did not identify a blocker in accessibility, timer behavior, stacking, or responsive placement.

## Verification

- `npm run test:unit -- --run src/__tests__/alertsStore.spec.ts src/__tests__/AppAlert.spec.ts src/__tests__/App.spec.ts`
- `CI=1 npm run test:e2e -- notifications.spec.ts`
