<?php

namespace App\Events;

use App\Models\Signalement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SignalementAssigne implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $signalement;
    public $agentId;

    public function __construct(Signalement $signalement, int $agentId)
    {
        // Charger relations nécessaires
        $this->signalement = $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles']);
        $this->agentId = $agentId;
    }

    public function broadcastOn(): array
    {
        // Canal dédié à l'agent
        return [
            new Channel('agents.' . $this->agentId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SignalementAssigne';
    }

    public function broadcastWith(): array
    {
        // Normaliser médias (comme l'index) pour envoi complet
        $photos = collect();
        $videos = collect();
        $audios = collect();
        foreach ($this->signalement->mediasFiles as $m) {
            $item = [
                'id' => $m->id,
                'url' => $m->url,
                'type_mime' => $m->type_mime,
                'nom_fichier' => $m->nom_fichier,
                'taille' => $m->formatted_size ?? $m->taille_fichier,
                'duree' => $m->formatted_duration ?? null,
            ];
            if ($m->type_media === 'photo') $photos->push($item);
            elseif ($m->type_media === 'video') $videos->push($item);
            elseif ($m->type_media === 'audio') $audios->push($item);
        }

        $payload = $this->signalement->toArray();
        $payload['agent_assigne'] = $this->signalement->agentAssigne;
        $payload['medias'] = [
            'photos' => $photos->values(),
            'videos' => $videos->values(),
            'audios' => $audios->values(),
        ];

        return [
            'signalement' => $payload,
        ];
    }
}












