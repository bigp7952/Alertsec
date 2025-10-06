<?php

namespace App\Events;

use App\Models\ZoneDanger;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ZoneDangerMiseAJour implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $zone;

    public function __construct(ZoneDanger $zone)
    {
        $this->zone = $zone->toArray();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('zones');
    }

    public function broadcastAs(): string
    {
        return 'ZoneDangerMiseAJour';
    }

    public function broadcastWith(): array
    {
        return ['zone' => $this->zone];
    }
}


