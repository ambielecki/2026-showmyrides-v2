<?php

namespace App\Console\Commands;

use App\Actions\Fortify\CreateNewUser;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

#[Signature('user:create-admin')]
#[Description('Create a verified administrator account')]
class CreateAdminUser extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(CreateNewUser $createNewUser): int
    {
        $name = text(label: 'Name', required: true);
        $email = text(label: 'Email', required: true);

        if (User::where('email', $email)->exists()) {
            $this->components->error('A user with that email address already exists.');

            return self::FAILURE;
        }

        $password = password(label: 'Password', required: true);
        $passwordConfirmation = password(label: 'Confirm password', required: true);

        try {
            $user = DB::transaction(function () use (
                $createNewUser,
                $name,
                $email,
                $password,
                $passwordConfirmation,
            ): User {
                $user = $createNewUser->create([
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                    'password_confirmation' => $passwordConfirmation,
                ]);

                $user->is_admin = true;
                $user->email_verified_at = now();
                $user->save();

                return $user;
            });
        } catch (ValidationException $exception) {
            foreach ($exception->errors() as $messages) {
                foreach ($messages as $message) {
                    $this->components->error($message);
                }
            }

            return self::FAILURE;
        }

        $this->components->info("Administrator {$user->email} created successfully.");

        return self::SUCCESS;
    }
}
