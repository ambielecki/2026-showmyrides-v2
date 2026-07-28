<?php

namespace App\Console\Commands;

use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Validation\ValidationException;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

#[Signature('user:update-password')]
#[Description("Update a user's password")]
class UpdateUserPassword extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ResetUserPassword $resetUserPassword): int
    {
        $email = text(label: 'Email', required: true);
        $user = User::where('email', $email)->first();

        if ($user === null) {
            $this->components->error('No user was found with that email address.');

            return self::FAILURE;
        }

        $password = password(label: 'Password', required: true);
        $passwordConfirmation = password(label: 'Confirm password', required: true);

        try {
            $resetUserPassword->reset($user, [
                'password' => $password,
                'password_confirmation' => $passwordConfirmation,
            ]);
        } catch (ValidationException $exception) {
            foreach ($exception->errors() as $messages) {
                foreach ($messages as $message) {
                    $this->components->error($message);
                }
            }

            return self::FAILURE;
        }

        $this->components->info("Password updated successfully for {$user->email}.");

        return self::SUCCESS;
    }
}
