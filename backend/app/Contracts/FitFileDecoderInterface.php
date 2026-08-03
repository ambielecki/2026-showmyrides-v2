<?php

namespace App\Contracts;

use App\Data\DecodedRideData;

interface FitFileDecoderInterface
{
    public function decode(string $absolutePath): DecodedRideData;
}
