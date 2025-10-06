<?php

namespace App\Events;

use App\Models\AgentTracking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentPositionMiseAJour implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $tracking;

    public function __construct(AgentTracking $tracking)
    {
        $this->tracking = $tracking->load('agent')->toArray();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('agents');
    }

    public function broadcastAs(): string
    {
        return 'AgentPositionMiseAJour';
    }

    public function broadcastWith(): array
    {
        return ['tracking' => $this->tracking];
    }
}


