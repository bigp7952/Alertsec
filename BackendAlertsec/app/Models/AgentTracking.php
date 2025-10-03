<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentTracking extends Model
{
    use HasFactory;

    protected $table = 'agent_tracking';

    protected $fillable = [
        'agent_id',
        'latitude',
        'longitude',
        'vitesse',
        'direction',
        'batterie',
        'is_online',
        'derniere_activite',
        'signalement_id',
        'debut_mission',
        'fin_mission_prevue',
    ];

    protected $casts = [
        'derniere_activite' => 'datetime',
        'debut_mission' => 'datetime',
        'fin_mission_prevue' => 'datetime',
    ];

    // Relations
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function signalement()
    {
        return $this->belongsTo(Signalement::class);
    }

    // Scopes
    public function scopeEnLigne($query)
    {
        return $query->where('is_online', true);
    }

    public function scopeHorsLigne($query)
    {
        return $query->where('is_online', false);
    }

    public function scopeEnMission($query)
    {
        return $query->whereNotNull('signalement_id');
    }

    public function scopeDisponibles($query)
    {
        return $query->where('is_online', true)
                    ->whereNull('signalement_id');
    }

    public function scopeParAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    // Méthodes utiles
    public function calculerDistance($latitude, $longitude)
    {
        $lat1 = deg2rad($this->latitude);
        $lon1 = deg2rad($this->longitude);
        $lat2 = deg2rad($latitude);
        $lon2 = deg2rad($longitude);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat/2) * sin($dlat/2) + cos($lat1) * cos($lat2) * sin($dlon/2) * sin($dlon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return 6371 * $c; // Distance en km
    }

    public function getStatutMissionAttribute()
    {
        if (!$this->signalement_id) {
            return 'disponible';
        }

        if ($this->fin_mission_prevue && now()->gt($this->fin_mission_prevue)) {
            return 'en_retard';
        }

        return 'en_mission';
    }

    public function getTempsMissionAttribute()
    {
        if (!$this->debut_mission) {
            return null;
        }

        return now()->diffInMinutes($this->debut_mission);
    }

    public static function mettreAJourPosition($agentId, $latitude, $longitude, $vitesse = null, $direction = null, $batterie = null)
    {
        return self::create([
            'agent_id' => $agentId,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'vitesse' => $vitesse,
            'direction' => $direction,
            'batterie' => $batterie,
            'is_online' => true,
            'derniere_activite' => now(),
        ]);
    }

    public static function demarrerMission($agentId, $signalementId, $dureeMinutes = 120)
    {
        return self::create([
            'agent_id' => $agentId,
            'signalement_id' => $signalementId,
            'debut_mission' => now(),
            'fin_mission_prevue' => now()->addMinutes($dureeMinutes),
            'is_online' => true,
            'derniere_activite' => now(),
        ]);
    }
}
