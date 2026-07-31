<?php

use App\Contracts\FitFileDecoderInterface;
use App\Contracts\RideFitProcessingServiceInterface;
use App\Data\DecodedRideData;
use App\Enums\RideProcessingStatus;
use App\Exceptions\InvalidRideFitFileException;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use App\Services\ArtisanRideProcessingLauncher;
use App\Services\RideFitProcessingService;
use App\Services\SportlogFitFileDecoder;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Defer\DeferredCallback;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Sportlog\FIT\Decoder;
use Sportlog\FIT\Profile\Messages\CourseMessage;
use Sportlog\FIT\Profile\Messages\FileIdMessage;
use Sportlog\FIT\Profile\Messages\RecordMessage;
use Sportlog\FIT\Profile\Messages\SessionMessage;
use Sportlog\FIT\Profile\Types\File;

uses(LazilyRefreshDatabase::class);

test('sportlog decoder maps one activity session to imperial ride data and geojson', function () {
    $fileId = new FileIdMessage;
    $fileId->setFieldValue(0, File::ACTIVITY);
    $session = new SessionMessage;
    $session->setFieldValue(2, 1154433600);
    $session->setFieldValue(7, 3723500);
    $session->setFieldValue(9, 3218688);
    $session->setFieldValue(14, 8047);
    $session->setFieldValue(15, 13411);
    $session->setFieldValue(59, 3600000);
    $course = new CourseMessage;
    $course->setFieldValue(5, 'Morning Loop');
    $first = new RecordMessage;
    $first->setFieldValue(0, 508201986);
    $first->setFieldValue(1, -848848690);
    $second = new RecordMessage;
    $second->setFieldValue(0, 508213917);
    $second->setFieldValue(1, -848836759);

    $decoder = Mockery::mock(Decoder::class);
    $decoder->shouldReceive('stream')->once()->andReturnUsing(
        function (string $path, callable $callback) use ($fileId, $session, $course, $first, $second): void {
            expect($path)->toBe('/tmp/activity.fit');
            foreach ([$fileId, $session, $course, $first, $second] as $message) {
                $callback($message);
            }
        },
    );

    $ride = (new SportlogFitFileDecoder($decoder))->decode('/tmp/activity.fit');

    expect($ride->garminName)->toBe('Morning Loop')
        ->and($ride->rideDateTime->toIso8601String())->toBe('2026-07-31T12:00:00+00:00')
        ->and($ride->distance)->toBe(20.0)
        ->and($ride->totalTime)->toBe(3724)
        ->and($ride->movingTime)->toBe(3600)
        ->and($ride->averageSpeed)->toBe(18.0)
        ->and($ride->maxSpeed)->toBe(30.0)
        ->and($ride->routeData['type'])->toBe('LineString')
        ->and($ride->routeData['coordinates'])->toHaveCount(2)
        ->and($ride->routeData['coordinates'][0][0])->toBeLessThan(0)
        ->and($ride->routeData['coordinates'][0][1])->toBeGreaterThan(0);
});

test('valid activities without gps complete without a route', function () {
    $fileId = new FileIdMessage;
    $fileId->setFieldValue(0, File::ACTIVITY);
    $session = new SessionMessage;
    $session->setFieldValue(2, 1154347200);

    $decoder = Mockery::mock(Decoder::class);
    $decoder->shouldReceive('stream')->once()->andReturnUsing(
        function (string $path, callable $callback) use ($fileId, $session): void {
            $callback($fileId);
            $callback($session);
        },
    );

    expect((new SportlogFitFileDecoder($decoder))->decode('/tmp/no-gps.fit')->routeData)->toBeNull();
});

test('decoder rejects files that are not exactly one activity session', function (array $messages) {
    $decoder = Mockery::mock(Decoder::class);
    $decoder->shouldReceive('stream')->once()->andReturnUsing(
        function (string $path, callable $callback) use ($messages): void {
            foreach ($messages as $message) {
                $callback($message);
            }
        },
    );

    expect(fn () => (new SportlogFitFileDecoder($decoder))->decode('/tmp/invalid.fit'))
        ->toThrow(InvalidRideFitFileException::class);
})->with(function (): array {
    $nonActivity = new FileIdMessage;
    $nonActivity->setFieldValue(0, 5);
    $activity = new FileIdMessage;
    $activity->setFieldValue(0, File::ACTIVITY);
    $session = new SessionMessage;
    $session->setFieldValue(2, 1154347200);

    return [
        'not an activity' => [[$nonActivity, $session]],
        'missing session' => [[$activity]],
        'multiple sessions' => [[$activity, $session, clone $session]],
        'missing start time' => [[$activity, new SessionMessage]],
    ];
});

test('processing saves decoded data and always removes the private upload', function () {
    Storage::fake('local');
    Storage::disk('local')->put('rides/uploads/ride.fit', 'fit');
    $user = User::factory()->create();
    $location = Location::factory()->for($user)->create();
    $ride = Ride::factory()->pending()->for($user)->for($location)->create();
    $decoded = new DecodedRideData(
        garminName: 'Embedded Name',
        rideDateTime: CarbonImmutable::parse('2026-07-31 12:00:00', 'UTC'),
        routeData: null,
        distance: 20.0,
        totalTime: 3600,
        movingTime: 3500,
        averageSpeed: 18.0,
        maxSpeed: 30.0,
    );
    $decoder = Mockery::mock(FitFileDecoderInterface::class);
    $decoder->shouldReceive('decode')->once()->andReturn($decoded);

    expect((new RideFitProcessingService($decoder))->process(
        $ride->external_id,
        'rides/uploads/ride.fit',
    ))->toBeTrue();

    expect($ride->refresh())
        ->processing_status->toBe(RideProcessingStatus::Complete)
        ->garmin_name->toBe('Embedded Name')
        ->distance->toBe('20.00')
        ->route_data->toBeNull()
        ->and(Storage::disk('local')->exists('rides/uploads/ride.fit'))->toBeFalse();
});

test('processing failures remain visible with a safe error and remove the upload', function () {
    Storage::fake('local');
    Storage::disk('local')->put('rides/uploads/bad.fit', 'bad');
    $ride = Ride::factory()->pending()->create();
    $decoder = Mockery::mock(FitFileDecoderInterface::class);
    $decoder->shouldReceive('decode')->once()->andThrow(new RuntimeException('sensitive detail'));

    expect((new RideFitProcessingService($decoder))->process(
        $ride->external_id,
        'rides/uploads/bad.fit',
    ))->toBeFalse();

    expect($ride->refresh())
        ->processing_status->toBe(RideProcessingStatus::Failed)
        ->processing_error->toBe('This FIT file could not be processed.')
        ->and(Storage::disk('local')->exists('rides/uploads/bad.fit'))->toBeFalse();
});

test('the launcher defers an artisan command call without dispatching a job', function () {
    Artisan::shouldReceive('call')
        ->once()
        ->with('rides:process-fit', [
            'ride' => 'ride-id',
            'file' => 'rides/uploads/ride.fit',
        ])
        ->andReturn(0);
    Concurrency::shouldReceive('defer')
        ->once()
        ->andReturnUsing(function (Closure $task): DeferredCallback {
            expect($task())->toBe(0);

            return new DeferredCallback(static fn (): null => null);
        });

    (new ArtisanRideProcessingLauncher)->launch('ride-id', 'rides/uploads/ride.fit');
});

test('the processing command delegates to its service contract', function () {
    $this->mock(
        RideFitProcessingServiceInterface::class,
        function (MockInterface $mock): void {
            $mock->shouldReceive('process')
                ->once()
                ->with('ride-id', 'rides/uploads/ride.fit')
                ->andReturnTrue();
        },
    );

    $this->artisan('rides:process-fit', [
        'ride' => 'ride-id',
        'file' => 'rides/uploads/ride.fit',
    ])->assertExitCode(0);
});
