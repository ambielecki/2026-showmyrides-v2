<?php

namespace App\Data;

class LocationData
{
    /**
     * @param  array{name: mixed, latitude: mixed, longitude: mixed}  $attributes
     */
    public static function fromArray(array $attributes): self
    {
        return new self(
            name: (string) $attributes['name'],
            latitude: (float) $attributes['latitude'],
            longitude: (float) $attributes['longitude'],
        );
    }

    public function __construct(
        public readonly string $name,
        public readonly float $latitude,
        public readonly float $longitude,
    ) {}

    /**
     * @return array{name: string, latitude: float, longitude: float}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
