<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(LazilyRefreshDatabase::class);

test('an administrator can be created interactively', function () {
    $this->artisan('user:create-admin')
        ->expectsQuestion('Name', 'Site Administrator')
        ->expectsQuestion('Email', 'admin@example.com')
        ->expectsQuestion('Password', 'correct horse battery staple')
        ->expectsQuestion('Confirm password', 'correct horse battery staple')
        ->expectsOutputToContain('Administrator admin@example.com created successfully.')
        ->assertSuccessful();

    $user = User::where('email', 'admin@example.com')->sole();

    expect($user->name)->toBe('Site Administrator')
        ->and($user->is_admin)->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check('correct horse battery staple', $user->password))->toBeTrue();
});

test('admin creation fails when the email already belongs to a user', function () {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'is_admin' => false,
    ]);

    $this->artisan('user:create-admin')
        ->expectsQuestion('Name', 'Existing User')
        ->expectsQuestion('Email', 'existing@example.com')
        ->expectsOutputToContain('A user with that email address already exists.')
        ->assertFailed();

    expect($user->fresh()->is_admin)->toBeFalse();
});

test('admin creation applies the Fortify password rules and confirmation', function () {
    $this->artisan('user:create-admin')
        ->expectsQuestion('Name', 'Site Administrator')
        ->expectsQuestion('Email', 'admin@example.com')
        ->expectsQuestion('Password', 'short')
        ->expectsQuestion('Confirm password', 'different')
        ->expectsOutputToContain('The password field confirmation does not match.')
        ->assertFailed();

    expect(User::where('email', 'admin@example.com')->exists())->toBeFalse();
});
