# Styling and Layout Updates

Update the styling and layouts before we go too far.

## Implementation

- Update the desktop navbar layout:
  - Keep Register / Log In or Settings / Log Out on the right.
  - Place the other links on the left after the homepage link.
- Place account actions at the bottom of the mobile drawer:
  - Register and Log In for guests.
  - Settings and Log Out for authenticated users.
- Use `./showmyrides.com_rides.png` as a styling reference:
  - Reproduce the homepage hero's green-to-tan gradient.
  - Increase the contrast of the three callouts and make their titles slightly larger.
  - `./localhost_5173_test_api.png` shows that the current card, form, and page
    backgrounds lack contrast. Make elevated cards lighter and form fields white.
  - Use the same dark green treatment for the navbar and footer.
- Maintain accessible contrast ratios between backgrounds, text, controls, and
  interactive states.
- Update `../../frontend/AGENTS.md` with these styling conventions.
