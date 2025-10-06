<?php

namespace App\Events;

use App\Models\Signalement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SignalementCree implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $signalement;

    public function __construct(Signalement $signalement)
    {
        $this->signalement = $signalement->load(['citoyen', 'agentAssigne', 'medias'])->toArray();
    }

    public function broadcastOn(): Channel
    {
        return new Channel('signalements');
    }

    public function broadcastAs(): string
    {
        return 'SignalementCree';
    }

    public function broadcastWith(): array
    {
        return ['signalement' => $this->signalement];
    }
}


