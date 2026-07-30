# Remember Me

Implement remember-me functionality for sign-in.

## Implementation

- Add an unchecked “Remember me for 30 days” checkbox to the password step.
- Use 1rem between the checkbox and its text and at least 1.25rem between the
  checkbox row and the Log In button.
- Match the white text-field surface while unchecked, then use primary green
  with a white checkmark when checked.
- Send the selected value to Laravel Fortify with the login credentials.
- Configure Laravel's remember-me cookie duration for 30 days.
- Do not store the user's email, password, or checkbox preference in frontend storage.
