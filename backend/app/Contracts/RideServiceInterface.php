<?php

namespace App\Contracts;

use App\Data\CreateRideData;
use App\Data\RideFiltersData;
use App\Data\UpdateRideData;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;

interface RideServiceInterface
{
    /**
     * @return LengthAwarePaginator<int, Ride>
     */
    public function paginateForUser(User $user, RideFiltersData $filters): LengthAwarePaginator;

    public function createPendingForUser(
        User $user,
        Location $location,
        CreateRideData $data,
        UploadedFile $fitFile,
    ): Ride;

    public function update(Ride $ride, UpdateRideData $data): Ride;

    public function delete(Ride $ride): void;
}
