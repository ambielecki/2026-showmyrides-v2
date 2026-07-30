<?php

namespace App\Data;

class LocationSearchResultData
{
    public function __construct(
        public readonly string $name,
        public readonly string $displayName,
        public readonly float $latitude,
        public readonly float $longitude,
    ) {}

    /**
     * @return array{name: string, display_name: string, latitude: float, longitude: float}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'display_name' => $this->displayName,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
