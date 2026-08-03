<?php

namespace App\Enums;

enum RideProcessingStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Complete = 'complete';
    case Failed = 'failed';
}
