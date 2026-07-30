# Frontend
This is a Vue.js with pinia and vue-router frontend. This repo is using playwright for e2e testing

## Libraries and skills
- We are using daisyUI for a component library
- Use the daisyUI skill for assistance

## Procedures
- All UI development should be accessible, please ensure that all components are accessible to users with disabilities.
- All UI development should be mobile responsive and work for both desktop and mobile devices.
- npm v26.x is installed with nvm, use this version for development and any necessary node tasks
- The backend api base url is set in VITE_API_URL in .env.local file.
- Prefer native JavaScript APIs over third-party libraries when possible.
- For css prefer rem spacing to px.
- Single-card pages, such as log in and follow-on authenticated views, should sit below the navbar with standard page padding. Do not vertically center a lone card in the viewport.
- Use the warm `base-200` application background with lighter `base-100` elevated cards, visible borders, and shadows. Form fields should use a white background.
- Build checkbox-and-label rows as explicit, vertically centered flex rows with at least `gap-4`. Keep at least the standard `space-y-5` form rhythm before adjacent action buttons. Unchecked checkboxes should use a white surface and checked checkboxes should use the primary color with primary-content contrast.
- Use the neutral dark green theme treatment with `neutral-content` text for both the navbar and footer.
- On desktop, keep primary application navigation beside the homepage link and account actions on the right. In the mobile drawer, anchor account actions at the bottom.
- Homepage callout cards should use the darker `base-300` surface. Preserve the green-to-tan hero gradient when modifying the homepage.
- Check WCAG AA contrast for text, controls, hover states, active states, and focus indicators whenever theme or surface colors change.
- Use the Playwright or Google Chrome Skill as needed for frontend testing and implementation
- Be mindful of bundle sizes, prefer solutions that only pull in necessary components or ui elements, not the entire package
- Always stop the vite dev server when finished
- Use the shared Pinia alert store for success, warning, and error messaging. Do not implement separate alert or toast systems.

## Resources
- The current live site exists at https://showmyrides.com and can be used as a reference
