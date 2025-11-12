<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Signalement extends Model
{
    use HasFactory;

    protected $fillable = [
        'citoyen_id',
        'description',
        'niveau',
        'status',
        'type',
        'priorite',
        'latitude',
        'longitude',
        'adresse',
        'heure',
        'date_signalement',
        'agent_assigne_id',
        'date_assignation',
        'date_traitement',
        'medias',
        'contact',
        'notes_agent',
        'notes_superviseur',
    ];

    protected $casts = [
        'date_signalement' => 'datetime',
        'date_assignation' => 'datetime',
        'date_traitement' => 'datetime',
        'medias' => 'array',
        'contact' => 'array',
    ];

    // Relations
    public function citoyen()
    {
        return $this->belongsTo(User::class, 'citoyen_id');
    }

    public function agentAssigne()
    {
        return $this->belongsTo(User::class, 'agent_assigne_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class);
    }

    public function mediasFiles()
    {
        return $this->hasMany(Media::class);
    }

    // Scopes
    public function scopeCritiques($query)
    {
        return $query->where('niveau', 'danger-critical');
    }

    public function scopeEnCours($query)
    {
        return $query->where('status', 'en cours');
    }

    public function scopeNonTraites($query)
    {
        return $query->where('status', 'non traité');
    }

    public function scopeTraites($query)
    {
        return $query->where('status', 'traité');
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParNiveau($query, $niveau)
    {
        return $query->where('niveau', $niveau);
    }

    public function scopeParAgent($query, $agentId)
    {
        return $query->where('agent_assigne_id', $agentId);
    }

    public function scopeDansZone($query, $latitude, $longitude, $rayon = 1000)
    {
        return $query->whereRaw("
            (6371 * acos(cos(radians(?)) 
            * cos(radians(latitude)) 
            * cos(radians(longitude) - radians(?)) 
            + sin(radians(?)) 
            * sin(radians(latitude)))) < ?
        ", [$latitude, $longitude, $latitude, $rayon / 1000]);
    }

    // Méthodes utiles
    public function calculerPriorite()
    {
        $score = 0;
        
        // Niveau de danger
        switch ($this->niveau) {
            case 'danger-critical':
                $score += 40;
                break;
            case 'danger-medium':
                $score += 20;
                break;
            case 'safe-zone':
                $score += 5;
                break;
        }
        
        // Type de signalement
        switch ($this->type) {
            case 'agression':
                $score += 30;
                break;
            case 'vol':
                $score += 25;
                break;
            case 'accident':
                $score += 20;
                break;
            case 'incendie':
                $score += 35;
                break;
            default:
                $score += 10;
                break;
        }
        
        // Temps écoulé depuis le signalement
        $minutes = $this->date_signalement->diffInMinutes(now());
        if ($minutes < 30) $score += 20;
        elseif ($minutes < 60) $score += 15;
        elseif ($minutes < 120) $score += 10;
        
        // Déterminer la priorité
        if ($score >= 70) return 'critique';
        if ($score >= 50) return 'haute';
        if ($score >= 30) return 'moyenne';
        return 'basse';
    }

    public function assignerAgent($agentId)
    {
        $this->update([
            'agent_assigne_id' => $agentId,
            'status' => 'en cours',
            'date_assignation' => now(),
        ]);

        // Mettre à jour la charge de travail de l'agent
        $agent = User::find($agentId);
        $agent->increment('charge_travail');

        // Créer une notification
        Notification::create([
            'user_id' => $agentId,
            'titre' => 'Nouveau signalement assigné',
            'message' => "Un signalement de type {$this->type} vous a été assigné",
            'type' => 'info',
            'donnees' => ['signalement_id' => $this->id],
            'action_url' => "/signalements/{$this->id}",
        ]);
    }

    public function marquerCommeTraite($notes = null)
    {
        $this->update([
            'status' => 'traité',
            'date_traitement' => now(),
            'notes_agent' => $notes,
        ]);

        // Réduire la charge de travail de l'agent
        if ($this->agent_assigne_id) {
            $agent = User::find($this->agent_assigne_id);
            $agent->decrement('charge_travail');
        }
    }

    public function getDistanceFromAgent($agentId)
    {
        $agent = User::find($agentId);
        if (!$agent || !$agent->dernierePosition) {
            return null;
        }

        return $this->calculerDistance(
            $agent->dernierePosition->latitude,
            $agent->dernierePosition->longitude
        );
    }

    private function calculerDistance($lat2, $lon2)
    {
        $lat1 = $this->latitude;
        $lon1 = $this->longitude;

        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat/2) * sin($dlat/2) + cos($lat1) * cos($lat2) * sin($dlon/2) * sin($dlon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return 6371 * $c; // Distance en km
    }
}
















