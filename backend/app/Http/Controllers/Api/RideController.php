<?php

namespace App\Http\Controllers\Api;

use App\Contracts\RideServiceInterface;
use App\Data\CreateRideData;
use App\Data\RideFiltersData;
use App\Data\UpdateRideData;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListRidesRequest;
use App\Http\Requests\StoreRideRequest;
use App\Http\Requests\UpdateRideRequest;
use App\Http\Resources\RideResource;
use App\Http\Resources\RideSummaryResource;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class RideController extends Controller
{
    public function __construct(private RideServiceInterface $rideService) {}

    public function index(ListRidesRequest $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        return RideSummaryResource::collection(
            $this->rideService->paginateForUser(
                $user,
                new RideFiltersData(
                    locationExternalId: $request->validated('location'),
                    range: (string) $request->validated('range', 'all'),
                    perPage: (int) $request->validated('per_page', 10),
                ),
            ),
        );
    }

    public function store(StoreRideRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $location = Location::query()
            ->where('external_id', $request->validated('location_external_id'))
            ->where(function ($query) use ($user): void {
                $query->whereNull('user_id')->orWhere('user_id', $user->id);
            })
            ->firstOrFail();
        $ride = $this->rideService->createPendingForUser(
            $user,
            $location,
            new CreateRideData(
                name: (string) $request->validated('name'),
                description: $request->validated('description'),
            ),
            $request->file('fit_file'),
        );

        return (new RideResource($ride))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Ride $ride): RideResource
    {
        Gate::authorize('view', $ride);

        return new RideResource($ride->load('location'));
    }

    public function update(UpdateRideRequest $request, Ride $ride): RideResource
    {
        return new RideResource($this->rideService->update(
            $ride,
            new UpdateRideData(
                name: (string) $request->validated('name'),
                description: $request->validated('description'),
            ),
        ));
    }

    public function destroy(Ride $ride): Response
    {
        Gate::authorize('delete', $ride);
        $this->rideService->delete($ride);

        return response()->noContent();
    }
}
