<?php

namespace App\Contracts;

interface RideFitProcessingServiceInterface
{
    public function process(string $rideExternalId, string $filePath): bool;
}
