<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class RideResource extends RideSummaryResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'total_time' => $this->resource->total_time,
            'average_speed' => $this->resource->average_speed === null ? null : (float) $this->resource->average_speed,
            'max_speed' => $this->resource->max_speed === null ? null : (float) $this->resource->max_speed,
            'route_data' => $this->resource->route_data,
        ];
    }
}
