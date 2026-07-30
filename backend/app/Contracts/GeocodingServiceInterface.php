<?php

namespace App\Contracts;

use App\Data\LocationSearchResultData;

interface GeocodingServiceInterface
{
    /**
     * @return array<int, LocationSearchResultData>
     */
    public function search(string $query): array;
}
