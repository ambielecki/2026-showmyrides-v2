<?php

namespace App\Contracts;

interface RideProcessingLauncherInterface
{
    public function launch(string $rideExternalId, string $filePath): void;
}
