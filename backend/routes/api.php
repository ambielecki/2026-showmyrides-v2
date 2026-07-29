<?php

use App\Http\Controllers\Api\CurrentUserController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

Route::get('/user', CurrentUserController::class)->middleware('auth:sanctum');

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
