<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RideSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'external_id' => $this->resource->external_id,
            'name' => $this->resource->name,
            'description' => $this->resource->description,
            'ride_datetime' => $this->resource->ride_datetime?->toISOString(),
            'distance' => $this->resource->distance === null ? null : (float) $this->resource->distance,
            'moving_time' => $this->resource->moving_time,
            'processing_status' => $this->resource->processing_status->value,
            'processing_error' => $this->resource->processing_error,
            'location' => new LocationOptionResource($this->whenLoaded('location')),
        ];
    }
}
