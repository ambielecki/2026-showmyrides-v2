# Alerts and notifications implementation

## Decisions

- Publish alerts through typed Pinia actions: `success`, `warning`, and `error`.
- Render alerts from one application-level host without an additional injection or plugin layer.
- Show a visible severity label, distinct icon, semantic color, message, and accessible dismiss button.
- Position alerts full-width at the bottom on mobile and in the bottom-right on desktop.
- Auto-dismiss alerts after 20 seconds of active display time.
- Pause the dismissal timer while hovered, keyboard-focused, or when the document is hidden.
- Expose the temporary manual test page at `/test/notifications` without adding it to navigation.

## Implementation plan

1. Add the typed Pinia store and alert presentation components.
2. Mount the alert host in the application shell and enable the required daisyUI components.
3. Add the temporary notification test route and view.
4. Add unit and Playwright coverage for store behavior, accessibility, timing, ordering, dismissal, and responsive placement.
5. Update the frontend instructions, format the changes, and run all frontend verification.
