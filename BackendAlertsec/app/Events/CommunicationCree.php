<?php

namespace App\Events;

use App\Models\Communication;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommunicationCree implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $communication;
    public int $signalementId;

    public function __construct(Communication $communication)
    {
        $this->communication = $communication->load('user')->toArray();
        $this->signalementId = $communication->signalement_id;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('signalement.' . $this->signalementId);
    }

    public function broadcastAs(): string
    {
        return 'CommunicationCree';
    }

    public function broadcastWith(): array
    {
        return ['communication' => $this->communication];
    }
}


