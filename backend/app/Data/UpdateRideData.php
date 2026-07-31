<?php

namespace App\Data;

class UpdateRideData
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description,
    ) {}

    /**
     * @return array{name: string, description: string|null}
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
        ];
    }
}
