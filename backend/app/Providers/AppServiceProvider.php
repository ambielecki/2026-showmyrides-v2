<?php

namespace App\Providers;

use App\Contracts\GeocodingServiceInterface;
use App\Contracts\LocationServiceInterface;
use App\Services\LocationService;
use App\Services\NominatimService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(LocationServiceInterface::class, LocationService::class);
        $this->app->bind(GeocodingServiceInterface::class, NominatimService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('location-search', function (Request $request): Limit {
            return Limit::perMinute(10)
                ->by((string) ($request->user()?->id ?? $request->ip()))
                ->response(fn (): JsonResponse => response()->json([
                    'message' => 'Too many location searches. Please try again shortly.',
                ], 429));
        });
    }
}
