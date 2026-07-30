# Remember Me

Implement remember-me functionality for sign-in.

## Implementation

- Add an unchecked “Remember me for 30 days” checkbox to the password step.
- Send the selected value to Laravel Fortify with the login credentials.
- Configure Laravel's remember-me cookie duration for 30 days.
- Do not store the user's email, password, or checkbox preference in frontend storage.
