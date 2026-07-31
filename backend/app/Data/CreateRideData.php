<?php

namespace App\Data;

class CreateRideData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description,
    ) {}
}
