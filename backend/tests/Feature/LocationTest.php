<?php

use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('system locations are installed with stable identifiers and coordinates', function () {
    $watopia = Location::query()->where('system_key', 'watopia')->firstOrFail();
    $makuriIslands = Location::query()->where('system_key', 'makuri-islands')->firstOrFail();

    expect($watopia)
        ->external_id->toBe('b9efc6c1-1f62-4ec4-a927-7270df4c288b')
        ->user_id->toBeNull()
        ->name->toBe('Watopia')
        ->map_provider->toBe('watopia')
        ->latitude->toBe('-11.683420')
        ->longitude->toBe('166.955010')
        ->and($makuriIslands)
        ->external_id->toBe('afbd2885-bf52-41ca-9472-5f4b402d6651')
        ->user_id->toBeNull()
        ->name->toBe('Makuri Islands');
});

test('authenticated users receive only their paginated locations', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Location::factory()->count(11)->for($user)->create();
    Location::factory()->for($otherUser)->create(['name' => 'Private Forest']);

    $response = $this->actingAs($user)->getJson('/api/locations');

    $response->assertSuccessful()
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('meta.current_page', 1)
        ->assertJsonPath('meta.last_page', 2)
        ->assertJsonPath('meta.total', 11)
        ->assertJsonMissing(['name' => 'Private Forest'])
        ->assertJsonMissing(['name' => 'Watopia'])
        ->assertJsonMissingPath('data.0.id')
        ->assertJsonMissingPath('data.0.user_id');
});

test('authenticated users can create locations with server controlled attributes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/locations', [
        'name' => 'Harold Parker State Forest',
        'latitude' => 42.614865,
        'longitude' => -71.095166,
        'system_key' => 'not-allowed',
        'map_provider' => 'not-allowed',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Harold Parker State Forest')
        ->assertJsonPath('data.latitude', 42.614865)
        ->assertJsonPath('data.longitude', -71.095166)
        ->assertJsonMissingPath('data.id')
        ->assertJsonMissingPath('data.user_id')
        ->assertJsonMissingPath('data.system_key')
        ->assertJsonMissingPath('data.map_provider');

    $location = Location::query()
        ->whereBelongsTo($user)
        ->where('name', 'Harold Parker State Forest')
        ->firstOrFail();

    expect(Str::isUuid($location->external_id, 4))->toBeTrue()
        ->and($location->system_key)->toBeNull()
        ->and($location->map_provider)->toBe('openstreetmap');
});

test('location input validates coordinate boundaries', function (array $input, string $field) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/locations', $input)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'missing name' => [
        ['latitude' => 42, 'longitude' => -71],
        'name',
    ],
    'latitude too low' => [
        ['name' => 'Invalid', 'latitude' => -90.000001, 'longitude' => -71],
        'latitude',
    ],
    'latitude too high' => [
        ['name' => 'Invalid', 'latitude' => 90.000001, 'longitude' => -71],
        'latitude',
    ],
    'longitude too low' => [
        ['name' => 'Invalid', 'latitude' => 42, 'longitude' => -180.000001],
        'longitude',
    ],
    'longitude too high' => [
        ['name' => 'Invalid', 'latitude' => 42, 'longitude' => 180.000001],
        'longitude',
    ],
]);

test('users can update their own locations', function () {
    $user = User::factory()->create();
    $location = Location::factory()->for($user)->create();

    $response = $this->actingAs($user)->patchJson("/api/locations/{$location->external_id}", [
        'name' => 'Updated Trail Network',
        'latitude' => 43.100001,
        'longitude' => -70.900001,
    ]);

    $response->assertSuccessful()
        ->assertJsonPath('data.external_id', $location->external_id)
        ->assertJsonPath('data.name', 'Updated Trail Network');

    expect($location->refresh())
        ->name->toBe('Updated Trail Network')
        ->latitude->toBe('43.100001')
        ->longitude->toBe('-70.900001');
});

test('users cannot update locations owned by another user or system locations', function () {
    $user = User::factory()->create();
    $otherLocation = Location::factory()->create();
    $systemLocation = Location::query()->where('system_key', 'watopia')->firstOrFail();
    $input = [
        'name' => 'Not Allowed',
        'latitude' => 42,
        'longitude' => -71,
    ];

    $this->actingAs($user)
        ->patchJson("/api/locations/{$otherLocation->external_id}", $input)
        ->assertForbidden();

    $this->actingAs($user)
        ->patchJson("/api/locations/{$systemLocation->external_id}", $input)
        ->assertForbidden();
});

test('location management requires authentication', function () {
    $location = Location::factory()->create();

    $this->getJson('/api/locations')->assertUnauthorized();
    $this->postJson('/api/locations', [])->assertUnauthorized();
    $this->patchJson("/api/locations/{$location->external_id}", [])->assertUnauthorized();
});
