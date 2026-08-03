<?php

namespace App\Http\Controllers\Api;

use App\Contracts\LocationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\LocationOptionResource;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class LocationOptionController extends Controller
{
    public function __construct(private LocationServiceInterface $locationService) {}

    public function __invoke(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Location::class);

        /** @var User $user */
        $user = $request->user();

        return LocationOptionResource::collection(
            $this->locationService->optionsForUser($user),
        );
    }
}
