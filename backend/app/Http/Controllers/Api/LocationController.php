<?php

namespace App\Http\Controllers\Api;

use App\Contracts\LocationServiceInterface;
use App\Data\LocationData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class LocationController extends Controller
{
    public function __construct(private LocationServiceInterface $locationService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Location::class);

        /** @var User $user */
        $user = $request->user();

        return LocationResource::collection(
            $this->locationService->paginateForUser($user),
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreLocationRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $location = $this->locationService->createForUser(
            $user,
            LocationData::fromArray($request->validated()),
        );

        return (new LocationResource($location))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateLocationRequest $request, Location $location): LocationResource
    {
        $updatedLocation = $this->locationService->update(
            $location,
            LocationData::fromArray($request->validated()),
        );

        return new LocationResource($updatedLocation);
    }
}
