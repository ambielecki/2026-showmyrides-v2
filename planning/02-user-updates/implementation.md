# User updates implementation

## Decisions

- Generate UUIDv4 `external_id` values in application code whenever a user is created.
- Add a unique index to `external_id` and make the column non-nullable.
- Add a non-nullable `is_admin` boolean that defaults to `false`.
- Fail admin creation when the supplied email already belongs to a user.
- Mark administrators created through the CLI as email verified.
- Name the commands `user:create-admin` and `user:update-password`.
- Apply the same password validation rules used by Fortify and require password confirmation.

## Implementation plan

1. Add a migration for the user columns.
2. Update the `User` model with UUID generation, admin casting, and default model state.
3. Add the interactive admin-creation and password-update Artisan commands.
4. Add Pest feature coverage for the model changes, migration constraints, and both command workflows.
5. Run the targeted backend tests, full backend test suite, and Pint.
