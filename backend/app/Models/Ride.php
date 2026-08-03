<?php

namespace App\Models;

use App\Enums\RideProcessingStatus;
use Database\Factories\RideFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable([
    'user_id',
    'location_id',
    'name',
    'garmin_name',
    'description',
    'ride_datetime',
    'route_data',
    'distance',
    'total_time',
    'moving_time',
    'average_speed',
    'max_speed',
    'processing_status',
    'processing_error',
])]
#[Hidden(['id', 'user_id', 'location_id'])]
class Ride extends Model
{
    /** @use HasFactory<RideFactory> */
    use HasFactory;

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'processing_status' => RideProcessingStatus::Pending->value,
    ];

    /**
     * Bootstrap the model and its traits.
     */
    protected static function booted(): void
    {
        static::creating(function (Ride $ride): void {
            $ride->external_id ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function getRouteKeyName(): string
    {
        return 'external_id';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ride_datetime' => 'datetime',
            'route_data' => 'array',
            'distance' => 'decimal:2',
            'total_time' => 'integer',
            'moving_time' => 'integer',
            'average_speed' => 'decimal:2',
            'max_speed' => 'decimal:2',
            'processing_status' => RideProcessingStatus::class,
        ];
    }
}
