<?php

use App\Contracts\RideProcessingLauncherInterface;
use App\Enums\RideProcessingStatus;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;

uses(LazilyRefreshDatabase::class);

test('location options contain system and owned locations in alphabetical order', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    Location::factory()->for($user)->create(['name' => 'Blue Hills']);
    Location::factory()->for($other)->create(['name' => 'Private Trail']);

    $this->actingAs($user)
        ->getJson('/api/location-options')
        ->assertSuccessful()
        ->assertJsonPath('data.0.name', 'Blue Hills')
        ->assertJsonPath('data.1.name', 'Makuri Islands')
        ->assertJsonPath('data.2.name', 'Watopia')
        ->assertJsonMissing(['name' => 'Private Trail']);
});

test('users can upload a fit file and create a pending ride', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    $location = Location::factory()->for($user)->create();

    $this->mock(
        RideProcessingLauncherInterface::class,
        function (MockInterface $mock): void {
            $mock->shouldReceive('launch')
                ->once()
                ->withArgs(function (string $rideId, string $path): bool {
                    expect($rideId)->not->toBeEmpty()
                        ->and($path)->toStartWith('rides/uploads/')
                        ->and(Storage::disk('local')->exists($path))->toBeTrue();

                    return true;
                });
        },
    );

    $response = $this->actingAs($user)->post('/api/rides', [
        'name' => 'Friday Night Ride',
        'description' => 'A social lap.',
        'location_external_id' => $location->external_id,
        'fit_file' => UploadedFile::fake()->create('friday.fit', 32, 'application/octet-stream'),
    ], ['Accept' => 'application/json']);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'Friday Night Ride')
        ->assertJsonPath('data.processing_status', 'pending')
        ->assertJsonPath('data.location.external_id', $location->external_id);

    $ride = Ride::query()->whereBelongsTo($user)->firstOrFail();
    expect($ride->location->is($location))->toBeTrue()
        ->and($ride->processing_status)->toBe(RideProcessingStatus::Pending);
});

test('ride uploads validate fit files and owner scoped locations', function () {
    $user = User::factory()->create();
    $otherLocation = Location::factory()->create();

    $this->actingAs($user)->post('/api/rides', [
        'name' => '',
        'location_external_id' => $otherLocation->external_id,
        'fit_file' => UploadedFile::fake()->create('not-fit.txt', 1),
    ], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'location_external_id', 'fit_file']);
});

test('ride lists are scoped filtered paginated ordered and exclude routes', function () {
    CarbonImmutable::setTestNow('2026-07-31 12:00:00');
    $user = User::factory()->create();
    $other = User::factory()->create();
    $location = Location::factory()->for($user)->create();
    $secondLocation = Location::factory()->for($user)->create();

    $pending = Ride::factory()->pending()->for($user)->for($location)->create(['name' => 'Pending Ride']);
    $recent = Ride::factory()->for($user)->for($location)->create([
        'name' => 'Recent Ride',
        'ride_datetime' => now()->subDays(2),
    ]);
    Ride::factory()->for($user)->for($location)->create([
        'name' => 'Old Ride',
        'ride_datetime' => now()->subMonths(2),
    ]);
    Ride::factory()->for($user)->for($secondLocation)->create(['name' => 'Other Location']);
    Ride::factory()->for($other)->create(['name' => 'Private Ride']);

    $response = $this->actingAs($user)->getJson(
        "/api/rides?location={$location->external_id}&range=month&per_page=10",
    );

    $response->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.external_id', $pending->external_id)
        ->assertJsonPath('data.1.external_id', $recent->external_id)
        ->assertJsonPath('meta.total', 2)
        ->assertJsonMissingPath('data.0.route_data')
        ->assertJsonMissing(['name' => 'Private Ride'])
        ->assertJsonMissing(['name' => 'Old Ride']);

    CarbonImmutable::setTestNow();
});

test('owners can view update and delete complete pending and failed rides', function (string $state) {
    $user = User::factory()->create();
    $location = Location::factory()->for($user)->create();
    $factory = Ride::factory()->for($user)->for($location);
    $ride = match ($state) {
        'pending' => $factory->pending()->create(),
        'failed' => $factory->failed()->create(),
        default => $factory->create(),
    };

    $this->actingAs($user)
        ->getJson("/api/rides/{$ride->external_id}")
        ->assertSuccessful()
        ->assertJsonPath('data.external_id', $ride->external_id)
        ->assertJsonPath('data.processing_status', $state)
        ->assertJsonPath('data.route_data', $ride->route_data);

    $this->actingAs($user)
        ->patchJson("/api/rides/{$ride->external_id}", [
            'name' => 'Updated Ride',
            'description' => 'Updated description.',
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.name', 'Updated Ride');

    $this->actingAs($user)
        ->deleteJson("/api/rides/{$ride->external_id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('rides', ['id' => $ride->id]);
})->with(['complete', 'pending', 'failed']);

test('users cannot access another users rides', function () {
    $user = User::factory()->create();
    $ride = Ride::factory()->create();

    $this->actingAs($user)->getJson("/api/rides/{$ride->external_id}")->assertForbidden();
    $this->actingAs($user)->patchJson("/api/rides/{$ride->external_id}", [
        'name' => 'No',
        'description' => null,
    ])->assertForbidden();
    $this->actingAs($user)->deleteJson("/api/rides/{$ride->external_id}")->assertForbidden();
});

test('ride management requires authentication', function () {
    $ride = Ride::factory()->create();

    $this->getJson('/api/rides')->assertUnauthorized();
    $this->postJson('/api/rides', [])->assertUnauthorized();
    $this->getJson("/api/rides/{$ride->external_id}")->assertUnauthorized();
    $this->patchJson("/api/rides/{$ride->external_id}", [])->assertUnauthorized();
    $this->deleteJson("/api/rides/{$ride->external_id}")->assertUnauthorized();
});
