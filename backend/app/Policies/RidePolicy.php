<?php

namespace App\Policies;

use App\Models\Ride;
use App\Models\User;

class RidePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ride $ride): bool
    {
        return $ride->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Ride $ride): bool
    {
        return $ride->user_id === $user->id;
    }

    public function delete(User $user, Ride $ride): bool
    {
        return $ride->user_id === $user->id;
    }
}
