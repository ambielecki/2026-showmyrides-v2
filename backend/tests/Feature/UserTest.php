<?php

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('users receive a unique UUIDv4 external id and are not administrators by default', function () {
    $user = User::factory()->create();

    expect(Str::isUuid($user->external_id, 4))->toBeTrue()
        ->and($user->is_admin)->toBeFalse();

    expect(fn () => User::factory()->create([
        'external_id' => $user->external_id,
    ]))->toThrow(QueryException::class);
});

test('internal user ids and credentials are excluded from serialization', function () {
    $user = User::factory()->create();
    $serializedUser = $user->toArray();

    expect($serializedUser)
        ->not->toHaveKeys(['id', 'password', 'remember_token'])
        ->toHaveKeys(['external_id', 'is_admin']);
});
