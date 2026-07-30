<?php

namespace App\Services;

use App\Data\LocationData;
use App\Models\Location;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class LocationService
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
