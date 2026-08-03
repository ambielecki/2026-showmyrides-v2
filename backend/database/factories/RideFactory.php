<?php

namespace Database\Factories;

use App\Enums\RideProcessingStatus;
use App\Models\Location;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ride>
 */
class RideFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'location_id' => Location::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->sentence(),
            'ride_datetime' => fake()->dateTimeBetween('-1 year'),
            'route_data' => [
                'type' => 'LineString',
                'coordinates' => [
                    [-71.095166, 42.614865],
                    [-71.094500, 42.615500],
                ],
            ],
            'distance' => fake()->randomFloat(2, 1, 100),
            'total_time' => fake()->numberBetween(600, 30000),
            'moving_time' => fake()->numberBetween(600, 30000),
            'average_speed' => fake()->randomFloat(2, 5, 25),
            'max_speed' => fake()->randomFloat(2, 10, 50),
            'processing_status' => RideProcessingStatus::Complete,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'ride_datetime' => null,
            'route_data' => null,
            'distance' => null,
            'total_time' => null,
            'moving_time' => null,
            'average_speed' => null,
            'max_speed' => null,
            'processing_status' => RideProcessingStatus::Pending,
        ]);
    }

    public function failed(): static
    {
        return $this->pending()->state(fn (): array => [
            'processing_status' => RideProcessingStatus::Failed,
            'processing_error' => 'This FIT file could not be processed.',
        ]);
    }
}
