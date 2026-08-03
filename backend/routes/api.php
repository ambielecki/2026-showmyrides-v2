<?php

use App\Http\Controllers\Api\CurrentUserController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\LocationOptionController;
use App\Http\Controllers\Api\LocationSearchController;
use App\Http\Controllers\Api\RideController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/user', CurrentUserController::class)->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/location-search', LocationSearchController::class)
        ->middleware('throttle:location-search');
    Route::get('/location-options', LocationOptionController::class);
    Route::apiResource('locations', LocationController::class)
        ->only(['index', 'store', 'update']);
    Route::apiResource('rides', RideController::class);
});

if (app()->environment(['local', 'testing'])) {
    Route::get('/test/public', static function (): JsonResponse {
        return response()->json([
            'message' => 'Public API request succeeded.',
            'authenticated' => false,
        ]);
    });

    Route::get('/test/authenticated', static function (): JsonResponse {
        return response()->json([
            'message' => 'Authenticated API request succeeded.',
            'authenticated' => true,
        ]);
    })->middleware('auth:sanctum');
}
