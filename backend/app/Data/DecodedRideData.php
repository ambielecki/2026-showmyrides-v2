<?php

namespace App\Data;

use Carbon\CarbonImmutable;

class DecodedRideData
{
    /**
     * @param  array{type: 'LineString', coordinates: array<int, array{0: float, 1: float}>}|null  $routeData
     */
    public function __construct(
        public readonly ?string $garminName,
        public readonly CarbonImmutable $rideDateTime,
        public readonly ?array $routeData,
        public readonly ?float $distance,
        public readonly ?int $totalTime,
        public readonly ?int $movingTime,
        public readonly ?float $averageSpeed,
        public readonly ?float $maxSpeed,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'garmin_name' => $this->garminName,
            'ride_datetime' => $this->rideDateTime,
            'route_data' => $this->routeData,
            'distance' => $this->distance,
            'total_time' => $this->totalTime,
            'moving_time' => $this->movingTime,
            'average_speed' => $this->averageSpeed,
            'max_speed' => $this->maxSpeed,
        ];
    }
}
