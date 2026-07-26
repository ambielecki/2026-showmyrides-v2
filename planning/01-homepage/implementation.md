# Homepage Implementation

## Summary

Build a static, production-inspired homepage with a responsive Vue application shell,
DaisyUI components, the current ShowMyRides copy, backend-hosted carousel images, and
data-driven highlight cards.

## Implementation

- Configure Tailwind CSS 4 and DaisyUI 5 with a light forest-green and warm-cream theme.
- Add a fixed navbar, desktop route links, and a mobile right-side drawer opened by a
  hamburger button. Close the drawer by its close button, backdrop, Escape key, or route
  selection.
- Add logged-out, authenticated, and admin navigation states. Keep the running app logged
  out until authentication is connected.
- Add the homepage route and accessible placeholder views for future authentication,
  ride, settings, and admin routes.
- Render the homepage from typed static content containing the current hero text, three
  carousel images, and three highlight cards.
- Load images from the backend public storage URL and show an accessible local fallback
  when an image cannot be loaded.
- Add the responsive footer, page metadata, frontend documentation, unit tests, and
  Playwright coverage.

## Verification

- Run type checking and the production build.
- Run unit tests and linting.
- Run Chromium Playwright tests for desktop and mobile behavior.
- Verify carousel controls, image fallback, responsive ordering, route placeholders, and
  all mobile drawer close paths.
