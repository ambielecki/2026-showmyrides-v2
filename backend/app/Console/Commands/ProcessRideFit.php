<?php

namespace App\Console\Commands;

use App\Contracts\RideFitProcessingServiceInterface;
use Illuminate\Console\Command;

class ProcessRideFit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rides:process-fit
        {ride : The ride external ID}
        {file : The private storage path to the FIT file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process an uploaded FIT file for a ride';

    public function handle(RideFitProcessingServiceInterface $processingService): int
    {
        $processed = $processingService->process(
            (string) $this->argument('ride'),
            (string) $this->argument('file'),
        );

        return $processed ? self::SUCCESS : self::FAILURE;
    }
}
