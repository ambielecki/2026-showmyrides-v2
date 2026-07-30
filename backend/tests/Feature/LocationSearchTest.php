<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

uses(LazilyRefreshDatabase::class);

beforeEach(function () {
    config()->set('services.nominatim.base_url', 'https://nominatim.test');
    config()->set('services.nominatim.user_agent', 'ShowMyRides-Test/2.0');

    Cache::flush();
    RateLimiter::clear('nominatim:global');
    Http::preventStrayRequests();
});

test('authenticated users can search for normalized OpenStreetMap results', function () {
    Http::fake([
        'https://nominatim.test/search*' => Http::response([
            [
                'display_name' => 'Harold Parker State Forest, Andover, Massachusetts, United States',
                'lat' => '42.614865',
                'lon' => '-71.095166',
                'namedetails' => ['name' => 'Harold Parker State Forest'],
            ],
            [
                'display_name' => 'Invalid result',
                'lat' => null,
                'lon' => null,
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/location-search?query=Harold%20Parker');

    $response->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Harold Parker State Forest')
        ->assertJsonPath('data.0.latitude', 42.614865)
        ->assertJsonPath('data.0.longitude', -71.095166);

    Http::assertSent(function (Request $request): bool {
        return $request->url() === 'https://nominatim.test/search?q=Harold%20Parker&format=jsonv2&limit=5&namedetails=1'
            && $request->hasHeader('User-Agent', 'ShowMyRides-Test/2.0');
    });
});

test('search results are cached using normalized queries', function () {
    Http::fake([
        'https://nominatim.test/search*' => Http::response([]),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=Harold%20Parker')
        ->assertSuccessful();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=%20%20HAROLD%20%20PARKER%20')
        ->assertSuccessful();

    Http::assertSentCount(1);
});

test('uncached provider searches are globally limited to one per second', function () {
    Http::fake([
        'https://nominatim.test/search*' => Http::response([]),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=First%20Forest')
        ->assertSuccessful();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=Second%20Forest')
        ->assertTooManyRequests()
        ->assertJsonPath(
            'message',
            'Location search is busy. Please try again in a moment.',
        );

    Http::assertSentCount(1);
});

test('search validates queries', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=ab')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('query');

    Http::assertNothingSent();
});

test('search requires authentication', function () {
    $this->getJson('/api/location-search?query=forest')->assertUnauthorized();

    Http::assertNothingSent();
});

test('provider failures return a service unavailable response', function () {
    Http::fake([
        'https://nominatim.test/search*' => Http::response([], 500),
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/location-search?query=Unavailable%20Forest')
        ->assertServiceUnavailable()
        ->assertJsonPath('message', 'Location search is temporarily unavailable.');
});
