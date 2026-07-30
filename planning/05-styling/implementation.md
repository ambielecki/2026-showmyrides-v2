# Styling and Layout Implementation

## Navigation

- Split route data into primary and account navigation groups.
- Place authenticated ride and admin routes after the homepage link on desktop.
- Keep guest or authenticated account actions on the right side of the desktop
  navbar.
- Anchor account actions to the bottom of the mobile drawer for both guests and
  authenticated users.
- Give each navigation group a unique accessible label.

## Visual System

- Use the neutral dark green theme color with light text for the navbar and footer.
- Use the warmer base background for application pages and lighter elevated cards
  with visible borders and shadows.
- Use white form fields with visible borders and focus indicators.
- Add a responsive green-to-tan gradient to the homepage hero.
- Darken homepage callout cards and increase their heading size.

## Verification

- Extend unit tests for role-aware navigation grouping and mobile placement.
- Add end-to-end checks for responsive placement, visual surfaces, and WCAG AA
  contrast.
- Run linting, the production build, unit tests, and the Chromium Playwright suite.
- Inspect desktop and mobile layouts in a browser against the supplied screenshots.
