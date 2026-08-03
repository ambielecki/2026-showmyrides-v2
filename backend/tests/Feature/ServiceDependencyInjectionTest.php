<?php

use App\Contracts\FitFileDecoderInterface;
use App\Contracts\GeocodingServiceInterface;
use App\Contracts\LocationServiceInterface;
use App\Contracts\RideFitProcessingServiceInterface;
use App\Contracts\RideProcessingLauncherInterface;
use App\Contracts\RideServiceInterface;
use App\Data\LocationData;
use App\Data\LocationSearchResultData;
use App\Models\Location;
use App\Models\User;
use App\Services\ArtisanRideProcessingLauncher;
use App\Services\LocationService;
use App\Services\NominatimService;
use App\Services\RideFitProcessingService;
use App\Services\RideService;
use App\Services\SportlogFitFileDecoder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Http;
use Mockery\MockInterface;

uses(LazilyRefreshDatabase::class);

test('service contracts resolve to their configured implementations', function () {
    expect(app(LocationServiceInterface::class))
        ->toBeInstanceOf(LocationService::class)
        ->and(app(GeocodingServiceInterface::class))
        ->toBeInstanceOf(NominatimService::class)
        ->and(app(FitFileDecoderInterface::class))
        ->toBeInstanceOf(SportlogFitFileDecoder::class)
        ->and(app(RideFitProcessingServiceInterface::class))
        ->toBeInstanceOf(RideFitProcessingService::class)
        ->and(app(RideProcessingLauncherInterface::class))
        ->toBeInstanceOf(ArtisanRideProcessingLauncher::class)
        ->and(app(RideServiceInterface::class))
        ->toBeInstanceOf(RideService::class);
});

test('location controller uses the injected location service contract', function () {
    $user = User::factory()->create();
    $location = Location::factory()->for($user)->create([
        'name' => 'Injected Forest',
        'latitude' => 42.614865,
        'longitude' => -71.095166,
    ]);

    $this->mock(
        LocationServiceInterface::class,
        function (MockInterface $mock) use ($location, $user): void {
            $mock->shouldReceive('createForUser')
                ->once()
                ->withArgs(
                    fn (User $serviceUser, LocationData $data): bool => $serviceUser->is($user)
                        && $data->name === 'Injected Forest'
                        && $data->latitude === 42.614865
                        && $data->longitude === -71.095166,
                )
                ->andReturn($location);
        },
    );

    $this->actingAs($user)
        ->postJson('/api/locations', [
            'name' => 'Injected Forest',
            'latitude' => 42.614865,
            'longitude' => -71.095166,
        ])
        ->assertCreated()
        ->assertJsonPath('data.external_id', $location->external_id)
        ->assertJsonPath('data.name', 'Injected Forest');
});

test('location search controller uses the injected geocoding service contract', function () {
    Http::preventStrayRequests();

    $user = User::factory()->create();
    $result = new LocationSearchResultData(
        name: 'Injected Trail',
        displayName: 'Injected Trail, Massachusetts, United States',
        latitude: 42.614865,
        longitude: -71.095166,
    );

    $this->mock(
        GeocodingServiceInterface::class,
        function (MockInterface $mock) use ($result): void {
            $mock->shouldReceive('search')
                ->once()
                ->with('Injected Trail')
                ->andReturn([$result]);
        },
    );

    $this->actingAs($user)
        ->getJson('/api/location-search?query=Injected%20Trail')
        ->assertSuccessful()
        ->assertJsonPath('data.0.name', 'Injected Trail')
        ->assertJsonPath('data.0.latitude', 42.614865)
        ->assertJsonPath('data.0.longitude', -71.095166);

    Http::assertNothingSent();
});
