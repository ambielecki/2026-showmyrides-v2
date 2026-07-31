<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rides', function (Blueprint $table) {
            $table->id();
            $table->uuid('external_id')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('garmin_name')->nullable();
            $table->text('description')->nullable();
            $table->dateTime('ride_datetime')->nullable();
            $table->longText('route_data')->nullable();
            $table->decimal('distance', 10, 2)->nullable();
            $table->unsignedInteger('total_time')->nullable();
            $table->unsignedInteger('moving_time')->nullable();
            $table->decimal('average_speed', 10, 2)->nullable();
            $table->decimal('max_speed', 10, 2)->nullable();
            $table->string('processing_status')->default('pending');
            $table->text('processing_error')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'ride_datetime']);
            $table->index(['user_id', 'processing_status']);
            $table->index(['location_id', 'ride_datetime']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};
