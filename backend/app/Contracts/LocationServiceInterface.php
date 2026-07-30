<?php

namespace App\Contracts;

use App\Data\LocationData;
use App\Models\Location;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface LocationServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, Location>
     */
    public function paginateForUser(User $user, int $perPage = 10): LengthAwarePaginator;

    public function createForUser(User $user, LocationData $data): Location;

    public function update(Location $location, LocationData $data): Location;
}
