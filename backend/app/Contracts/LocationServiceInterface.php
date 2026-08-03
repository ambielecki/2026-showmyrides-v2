<?php

namespace App\Contracts;

use App\Data\LocationData;
use App\Models\Location;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface LocationServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, Location>
     */
    public function paginateForUser(User $user, int $perPage = 10): LengthAwarePaginator;

    /**
     * @return Collection<int, Location>
     */
    public function optionsForUser(User $user): Collection;

    public function createForUser(User $user, LocationData $data): Location;

    public function update(Location $location, LocationData $data): Location;
}
