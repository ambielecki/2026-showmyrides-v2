<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('a visitor can register and is authenticated as a non-administrator', function () {
    $response = $this->postJson('/register', [
        'name' => 'New Rider',
        'email' => 'rider@example.com',
        'password' => 'correct horse battery staple',
        'password_confirmation' => 'correct horse battery staple',
        'is_admin' => true,
    ]);

    $response->assertCreated();
    $this->assertAuthenticated();

    $user = User::where('email', 'rider@example.com')->sole();

    expect($user->name)->toBe('New Rider')
        ->and($user->is_admin)->toBeFalse();
});

test('registration validates the submitted account details', function () {
    $this->postJson('/register', [
        'name' => '',
        'email' => 'not-an-email',
        'password' => 'short',
        'password_confirmation' => 'different',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'password']);

    expect(User::query()->exists())->toBeFalse();
});

test('a user can log in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'rider@example.com',
    ]);

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk()
        ->assertJson(['two_factor' => false]);

    $this->assertAuthenticatedAs($user);
});

test('invalid credentials return a validation error without authenticating', function () {
    User::factory()->create([
        'email' => 'rider@example.com',
    ]);

    $this->postJson('/login', [
        'email' => 'rider@example.com',
        'password' => 'incorrect-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');

    $this->assertGuest();
});

test('an authenticated user can log out', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/logout')
        ->assertNoContent();

    $this->assertGuest();
});

test('the current user endpoint returns only public account fields', function () {
    $user = User::factory()->create([
        'is_admin' => true,
    ]);

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertExactJson([
            'data' => [
                'external_id' => $user->external_id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => true,
            ],
        ]);
});

test('the current user endpoint requires authentication', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

test('local diagnostic endpoints exercise public and authenticated requests', function () {
    $this->getJson('/api/test/public')
        ->assertOk()
        ->assertJson([
            'authenticated' => false,
        ]);

    $this->getJson('/api/test/authenticated')->assertUnauthorized();

    $this->actingAs(User::factory()->create())
        ->getJson('/api/test/authenticated')
        ->assertOk()
        ->assertJson([
            'authenticated' => true,
        ]);
});

test('authentication endpoints allow credentialed requests from the local frontend', function () {
    $response = $this->call('OPTIONS', '/login', server: [
        'HTTP_ORIGIN' => 'http://localhost:5173',
        'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,x-xsrf-token',
    ]);

    $response->assertNoContent()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
        ->assertHeader('Access-Control-Allow-Credentials', 'true');
});
