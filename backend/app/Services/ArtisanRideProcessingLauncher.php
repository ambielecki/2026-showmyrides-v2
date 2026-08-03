<?php

namespace App\Services;

use App\Contracts\RideProcessingLauncherInterface;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Concurrency;

class ArtisanRideProcessingLauncher implements RideProcessingLauncherInterface
{
    public function launch(string $rideExternalId, string $filePath): void
    {
        Concurrency::defer(
            static fn (): int => Artisan::call('rides:process-fit', [
                'ride' => $rideExternalId,
                'file' => $filePath,
            ]),
        );
    }
}
