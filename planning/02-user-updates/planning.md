# User updates
This will add the external_id and is_admin to the user table and model. We will also create commands for creating an
admin user and ability to change user passwords

# Implementation
- create a migration to add external_id after id to the users table, this will store a uuid4
  - Explore whether the uuid should be generated in code before saving the model or on the db side
  - Are any new indices needed
- Add boolean is_admin to the user model and defalut to 0
- Update User model for these changes.
- Create artisan commands to create an admin user. This command should prompt for user name, email, password and password
confirmation
- Create artisan command to update a user's password. This should ask for the user's email and if found allow
changing password (with confirmation)
