<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('locations')->insert([
            [
                'external_id' => 'b9efc6c1-1f62-4ec4-a927-7270df4c288b',
                'user_id' => null,
                'system_key' => 'watopia',
                'map_provider' => 'watopia',
                'name' => 'Watopia',
                'latitude' => -11.683420,
                'longitude' => 166.955010,
                'created_at' => '2026-07-09 15:43:30',
                'updated_at' => '2026-07-09 15:43:30',
            ],
            [
                'external_id' => 'afbd2885-bf52-41ca-9472-5f4b402d6651',
                'user_id' => null,
                'system_key' => 'makuri-islands',
                'map_provider' => 'makuri-islands',
                'name' => 'Makuri Islands',
                'latitude' => -10.780440,
                'longitude' => 165.829354,
                'created_at' => '2026-07-12 01:17:44',
                'updated_at' => '2026-07-12 01:17:44',
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('locations')
            ->whereIn('external_id', [
                'b9efc6c1-1f62-4ec4-a927-7270df4c288b',
                'afbd2885-bf52-41ca-9472-5f4b402d6651',
            ])
            ->delete();
    }
};
