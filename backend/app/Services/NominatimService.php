<?php

namespace App\Services;

use App\Data\LocationSearchResultData;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NominatimService
{
    /**
     * @return array<int, LocationSearchResultData>
     */
    public function search(string $query): array
    {
        $normalizedQuery = (string) Str::of($query)->squish()->lower();
        $cacheKey = 'nominatim:search:'.hash('sha256', $normalizedQuery);

        /** @var array<int, array{name: string, display_name: string, latitude: float, longitude: float}> $results */
        $results = Cache::remember(
            $cacheKey,
            now()->addDay(),
            fn (): array => $this->fetch(Str::squish($query)),
        );

        return array_map(
            fn (array $result): LocationSearchResultData => new LocationSearchResultData(
                name: $result['name'],
                displayName: $result['display_name'],
                latitude: $result['latitude'],
                longitude: $result['longitude'],
            ),
            $results,
        );
    }

    /**
     * @return array<int, array{name: string, display_name: string, latitude: float, longitude: float}>
     */
    private function fetch(string $query): array
    {
        $results = RateLimiter::attempt(
            'nominatim:global',
            1,
            fn (): array => $this->request($query),
            1,
        );

        if ($results === false) {
            throw new HttpException(429, 'Location search is busy. Please try again in a moment.');
        }

        return $results;
    }

    /**
     * @return array<int, array{name: string, display_name: string, latitude: float, longitude: float}>
     */
    private function request(string $query): array
    {
        try {
            $response = Http::baseUrl((string) config('services.nominatim.base_url'))
                ->withUserAgent((string) config('services.nominatim.user_agent'))
                ->acceptJson()
                ->connectTimeout(3)
                ->timeout(5)
                ->get('/search', [
                    'q' => $query,
                    'format' => 'jsonv2',
                    'limit' => 5,
                    'namedetails' => 1,
                ])
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            throw new HttpException(
                503,
                'Location search is temporarily unavailable.',
                $exception,
            );
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new HttpException(503, 'Location search returned an invalid response.');
        }

        return collect($payload)
            ->filter(fn (mixed $result): bool => is_array($result)
                && is_numeric(Arr::get($result, 'lat'))
                && is_numeric(Arr::get($result, 'lon'))
                && is_string(Arr::get($result, 'display_name')))
            ->map(function (array $result): array {
                $displayName = (string) Arr::get($result, 'display_name');
                $providerName = Arr::get($result, 'namedetails.name');
                $name = is_string($providerName) && $providerName !== ''
                    ? $providerName
                    : (string) Str::of($displayName)->before(',')->trim();

                return [
                    'name' => $name,
                    'display_name' => $displayName,
                    'latitude' => (float) Arr::get($result, 'lat'),
                    'longitude' => (float) Arr::get($result, 'lon'),
                ];
            })
            ->values()
            ->all();
    }
}
