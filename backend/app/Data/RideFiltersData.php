<?php

namespace App\Data;

class RideFiltersData
{
    public function __construct(
        public readonly ?string $locationExternalId,
        public readonly string $range,
        public readonly int $perPage,
    ) {}
}
