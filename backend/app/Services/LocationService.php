<?php

namespace App\Services;

use App\Contracts\LocationServiceInterface;
use App\Data\LocationData;
use App\Models\Location;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class LocationService implements LocationServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, Location>
     */
    public function paginateForUser(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return $user->locations()
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, Location>
     */
    public function optionsForUser(User $user): Collection
    {
        return Location::query()
            ->whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'external_id', 'name', 'map_provider']);
    }

    public function createForUser(User $user, LocationData $data): Location
    {
        /** @var Location $location */
        $location = $user->locations()->create($data->toArray());

        return $location;
    }

    public function update(Location $location, LocationData $data): Location
    {
        $location->update($data->toArray());

        return $location->refresh();
    }
}
