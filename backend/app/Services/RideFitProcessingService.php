<?php

namespace App\Services;

use App\Contracts\FitFileDecoderInterface;
use App\Contracts\RideFitProcessingServiceInterface;
use App\Enums\RideProcessingStatus;
use App\Models\Ride;
use Illuminate\Support\Facades\Storage;
use Throwable;

class RideFitProcessingService implements RideFitProcessingServiceInterface
{
    public function __construct(private FitFileDecoderInterface $fitFileDecoder) {}

    public function process(string $rideExternalId, string $filePath): bool
    {
        $ride = Ride::query()->where('external_id', $rideExternalId)->first();

        if ($ride === null) {
            Storage::disk('local')->delete($filePath);

            return false;
        }

        try {
            $ride->update([
                'processing_status' => RideProcessingStatus::Processing,
                'processing_error' => null,
            ]);

            $decodedRide = $this->fitFileDecoder->decode(
                Storage::disk('local')->path($filePath),
            );

            $ride->update([
                ...$decodedRide->toArray(),
                'processing_status' => RideProcessingStatus::Complete,
                'processing_error' => null,
            ]);

            return true;
        } catch (Throwable $exception) {
            report($exception);

            $ride->update([
                'processing_status' => RideProcessingStatus::Failed,
                'processing_error' => 'This FIT file could not be processed.',
            ]);

            return false;
        } finally {
            Storage::disk('local')->delete($filePath);
        }
    }
}
