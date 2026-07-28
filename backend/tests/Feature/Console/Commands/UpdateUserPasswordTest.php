<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(LazilyRefreshDatabase::class);

test("a user's password can be updated interactively", function () {
    $user = User::factory()->create([
        'email' => 'rider@example.com',
        'password' => 'old password',
    ]);

    $this->artisan('user:update-password')
        ->expectsQuestion('Email', 'rider@example.com')
        ->expectsQuestion('Password', 'new correct horse battery staple')
        ->expectsQuestion('Confirm password', 'new correct horse battery staple')
        ->expectsOutputToContain('Password updated successfully for rider@example.com.')
        ->assertSuccessful();

    expect(Hash::check('new correct horse battery staple', $user->fresh()->password))->toBeTrue();
});

test('password updates fail when no user has the supplied email', function () {
    $this->artisan('user:update-password')
        ->expectsQuestion('Email', 'missing@example.com')
        ->expectsOutputToContain('No user was found with that email address.')
        ->assertFailed();
});

test('password updates require confirmation', function () {
    $user = User::factory()->create([
        'email' => 'rider@example.com',
        'password' => 'old password',
    ]);

    $this->artisan('user:update-password')
        ->expectsQuestion('Email', 'rider@example.com')
        ->expectsQuestion('Password', 'new correct horse battery staple')
        ->expectsQuestion('Confirm password', 'different')
        ->expectsOutputToContain('The password field confirmation does not match.')
        ->assertFailed();

    expect(Hash::check('old password', $user->fresh()->password))->toBeTrue();
});
