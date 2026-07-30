<?php

namespace App\Http\Controllers\Api;

use App\Contracts\GeocodingServiceInterface;
use App\Data\LocationSearchResultData;
use App\Http\Controllers\Controller;
use App\Http\Requests\SearchLocationRequest;
use Illuminate\Http\JsonResponse;

class LocationSearchController extends Controller
{
    public function __construct(private GeocodingServiceInterface $geocodingService) {}

    /**
     * Handle the incoming request.
     */
    public function __invoke(SearchLocationRequest $request): JsonResponse
    {
        $results = $this->geocodingService->search(
            (string) $request->validated('query'),
        );

        return response()->json([
            'data' => array_map(
                static fn (LocationSearchResultData $result): array => $result->toArray(),
                $results,
            ),
        ]);
    }
}
