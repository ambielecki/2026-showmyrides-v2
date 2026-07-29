# Auth
Implement auth using Laravel Fortify and Sanctum

## Implementation
- Implement necessary routes for Fortify (register, login, logout)
  - We are not verifying emails at this time
  - Changing passwords will be implemented later
- Use Sanctum session auth
- Add the stateful api to backend/bootstrap/app.php
- Update backend/bootstrap/app.php so the new API routes expect JSON error handling
- Logged-out views should have Register and Log In buttons on the right of the navbar on desktop and visible in the mobile menu
- Logged-in users should see Settings (not implemented yet) and Log Out buttons
- All users registered through the frontend will have is_admin set as 0
- After registration, log in user and redirect users to the Rides list page (not yet implemented)
- Log In should be a two-step form: first accept an email, then a password and allow submission. Redirect to the Rides list after success.
- On the frontend, implement a service provider for HTTP calls using the native Fetch API
  - Use appropriate alerts for failures (warning for auth error for example or for validation errors)
  - Server errors should not display details on the frontend, just an error notification with Something Went Wrong
- The frontend uses http://localhost:5173; make sure this is included in CORS and other necessary configuration
- Create a test page on the frontend, and routes in the backend, to exercise API calls for both authenticated and unauthenticated requests. Authenticated routes should trigger a warning notification when called while logged out.
