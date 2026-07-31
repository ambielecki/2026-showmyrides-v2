<?php

namespace App\Services;

use App\Contracts\RideProcessingLauncherInterface;
use App\Contracts\RideServiceInterface;
use App\Data\CreateRideData;
use App\Data\RideFiltersData;
use App\Data\UpdateRideData;
use App\Enums\RideProcessingStatus;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class RideService implements RideServiceInterface
{
    public function __construct(private RideProcessingLauncherInterface $processingLauncher) {}

    /**
     * @return LengthAwarePaginator<int, Ride>
     */
    public function paginateForUser(User $user, RideFiltersData $filters): LengthAwarePaginator
    {
        $query = $user->rides()
            ->select([
                'id',
                'external_id',
                'user_id',
                'location_id',
                'name',
                'description',
                'ride_datetime',
                'distance',
                'moving_time',
                'processing_status',
                'processing_error',
                'created_at',
            ])
            ->with('location:id,external_id,name,map_provider');

        if ($filters->locationExternalId !== null) {
            $query->whereHas(
                'location',
                fn ($locationQuery) => $locationQuery->where(
                    'external_id',
                    $filters->locationExternalId,
                ),
            );
        }

        $rangeStart = match ($filters->range) {
            'week' => CarbonImmutable::now()->subWeek(),
            'month' => CarbonImmutable::now()->subMonth(),
            'year' => CarbonImmutable::now()->subYear(),
            default => null,
        };

        if ($rangeStart !== null) {
            $query->where(function ($dateQuery) use ($rangeStart): void {
                $dateQuery
                    ->where('ride_datetime', '>=', $rangeStart)
                    ->orWhereIn('processing_status', [
                        RideProcessingStatus::Pending->value,
                        RideProcessingStatus::Processing->value,
                    ]);
            });
        }

        return $query
            ->orderByRaw(
                'CASE WHEN processing_status IN (?, ?) THEN 0 ELSE 1 END',
                [RideProcessingStatus::Pending->value, RideProcessingStatus::Processing->value],
            )
            ->orderByDesc('ride_datetime')
            ->orderByDesc('created_at')
            ->paginate($filters->perPage)
            ->withQueryString();
    }

    public function createPendingForUser(
        User $user,
        Location $location,
        CreateRideData $data,
        UploadedFile $fitFile,
    ): Ride {
        $filePath = $fitFile->storeAs(
            'rides/uploads',
            Str::uuid().'.fit',
            'local',
        );

        if (! is_string($filePath)) {
            throw new RuntimeException('Unable to store the uploaded FIT file.');
        }

        $ride = null;

        try {
            /** @var Ride $ride */
            $ride = $user->rides()->create([
                'location_id' => $location->id,
                'name' => $data->name,
                'description' => $data->description,
                'processing_status' => RideProcessingStatus::Pending,
            ]);

            $this->processingLauncher->launch($ride->external_id, $filePath);

            return $ride->load('location');
        } catch (Throwable $exception) {
            $ride?->delete();
            Storage::disk('local')->delete($filePath);

            throw $exception;
        }
    }

    public function update(Ride $ride, UpdateRideData $data): Ride
    {
        $ride->update($data->toArray());

        return $ride->refresh()->load('location');
    }

    public function delete(Ride $ride): void
    {
        $ride->delete();
    }
}
