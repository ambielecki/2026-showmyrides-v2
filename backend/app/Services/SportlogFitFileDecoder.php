<?php

namespace App\Services;

use App\Contracts\FitFileDecoderInterface;
use App\Data\DecodedRideData;
use App\Exceptions\InvalidRideFitFileException;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Support\Str;
use Sportlog\FIT\Decoder;
use Sportlog\FIT\Profile\Message;
use Sportlog\FIT\Profile\Messages\CourseMessage;
use Sportlog\FIT\Profile\Messages\FileIdMessage;
use Sportlog\FIT\Profile\Messages\RecordMessage;
use Sportlog\FIT\Profile\Messages\SessionMessage;
use Sportlog\FIT\Profile\Messages\SportMessage;
use Sportlog\FIT\Profile\Messages\WorkoutMessage;
use Sportlog\FIT\Profile\Types\File;

class SportlogFitFileDecoder implements FitFileDecoderInterface
{
    private const METERS_PER_MILE = 1609.344;

    private const MILES_PER_HOUR_PER_METER_PER_SECOND = 2.2369362920544;

    private const DEGREES_PER_SEMICIRCLE = 180 / 2147483648;

    public function __construct(private Decoder $decoder) {}

    public function decode(string $absolutePath): DecodedRideData
    {
        $fileType = null;
        $sessions = [];
        $coordinates = [];
        $courseName = null;
        $workoutName = null;
        $sportName = null;

        $this->decoder->stream(
            $absolutePath,
            function (Message $message) use (
                &$fileType,
                &$sessions,
                &$coordinates,
                &$courseName,
                &$workoutName,
                &$sportName,
            ): void {
                if ($message instanceof FileIdMessage) {
                    $fileType = $message->getType();
                }

                if ($message instanceof SessionMessage) {
                    $sessions[] = $message;
                }

                if ($message instanceof RecordMessage) {
                    $coordinate = $this->coordinateFromRecord($message);

                    if ($coordinate !== null && end($coordinates) !== $coordinate) {
                        $coordinates[] = $coordinate;
                    }
                }

                if ($message instanceof CourseMessage) {
                    $courseName ??= $this->nonBlank($message->getName());
                }

                if ($message instanceof WorkoutMessage) {
                    $workoutName ??= $this->nonBlank($message->getWktName());
                }

                if ($message instanceof SportMessage) {
                    $sportName ??= $this->nonBlank($message->getName());
                }
            },
        );

        if ($fileType !== File::ACTIVITY) {
            throw new InvalidRideFitFileException('The FIT file is not an activity.');
        }

        if (count($sessions) !== 1) {
            throw new InvalidRideFitFileException('The FIT file must contain exactly one session.');
        }

        $session = $sessions[0];
        $startTime = $session->getStartTime();

        if (! $startTime instanceof DateTimeInterface) {
            throw new InvalidRideFitFileException('The FIT session does not contain a start time.');
        }

        $distanceMeters = $this->numericScalar($session->getTotalDistance());
        $averageMetersPerSecond = $this->numericScalar($session->getEnhancedAvgSpeed())
            ?? $this->numericScalar($session->getAvgSpeed());
        $maxMetersPerSecond = $this->numericScalar($session->getEnhancedMaxSpeed())
            ?? $this->numericScalar($session->getMaxSpeed());
        $movingSeconds = $this->numericScalar($session->getTotalMovingTime())
            ?? $this->numericScalar($session->getTotalTimerTime());

        return new DecodedRideData(
            garminName: $courseName
                ?? $workoutName
                ?? $sportName
                ?? $this->nonBlank($session->getSportProfileName()),
            rideDateTime: CarbonImmutable::instance($startTime)->utc(),
            routeData: count($coordinates) >= 2
                ? ['type' => 'LineString', 'coordinates' => $coordinates]
                : null,
            distance: $distanceMeters === null
                ? null
                : round($distanceMeters / self::METERS_PER_MILE, 2),
            totalTime: $this->roundedSeconds($session->getTotalElapsedTime()),
            movingTime: $movingSeconds === null ? null : (int) round($movingSeconds),
            averageSpeed: $averageMetersPerSecond === null
                ? null
                : round($averageMetersPerSecond * self::MILES_PER_HOUR_PER_METER_PER_SECOND, 2),
            maxSpeed: $maxMetersPerSecond === null
                ? null
                : round($maxMetersPerSecond * self::MILES_PER_HOUR_PER_METER_PER_SECOND, 2),
        );
    }

    /**
     * @return array{0: float, 1: float}|null
     */
    private function coordinateFromRecord(RecordMessage $record): ?array
    {
        $latitudeSemicircles = $record->getPositionLat();
        $longitudeSemicircles = $record->getPositionLong();

        if (! is_int($latitudeSemicircles) || ! is_int($longitudeSemicircles)) {
            return null;
        }

        $latitude = $latitudeSemicircles * self::DEGREES_PER_SEMICIRCLE;
        $longitude = $longitudeSemicircles * self::DEGREES_PER_SEMICIRCLE;

        if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
            return null;
        }

        return [round($longitude, 7), round($latitude, 7)];
    }

    private function numericScalar(int|float|array|null $value): ?float
    {
        return is_int($value) || is_float($value) ? (float) $value : null;
    }

    private function roundedSeconds(int|float|array|null $value): ?int
    {
        $seconds = $this->numericScalar($value);

        return $seconds === null ? null : (int) round($seconds);
    }

    private function nonBlank(?string $value): ?string
    {
        $value = $value === null ? null : trim($value);

        return $value === '' ? null : Str::limit($value, 255, '');
    }
}
