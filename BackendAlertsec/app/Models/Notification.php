<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titre',
        'message',
        'type',
        'lu',
        'date_lecture',
        'donnees',
        'action_url',
    ];

    protected $casts = [
        'date_lecture' => 'datetime',
        'donnees' => 'array',
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopeLues($query)
    {
        return $query->where('lu', true);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Méthodes utiles
    public function marquerCommeLue()
    {
        $this->update([
            'lu' => true,
            'date_lecture' => now(),
        ]);
    }

    public function getFormattedDateAttribute()
    {
        return $this->created_at->format('d/m/Y H:i');
    }

    public static function creerNotificationSignalement($userId, $signalement, $type = 'info')
    {
        $titre = match($type) {
            'assignation' => 'Nouveau signalement assigné',
            'mise_a_jour' => 'Signalement mis à jour',
            'traitement' => 'Signalement traité',
            default => 'Notification signalement'
        };

        $message = match($type) {
            'assignation' => "Un signalement de type {$signalement->type} vous a été assigné",
            'mise_a_jour' => "Le signalement #{$signalement->id} a été mis à jour",
            'traitement' => "Le signalement #{$signalement->id} a été traité",
            default => "Notification concernant le signalement #{$signalement->id}"
        };

        return self::create([
            'user_id' => $userId,
            'titre' => $titre,
            'message' => $message,
            'type' => $type,
            'donnees' => ['signalement_id' => $signalement->id],
            'action_url' => "/signalements/{$signalement->id}",
        ]);
    }

    public static function creerNotificationZone($userId, $zone, $type = 'warning')
    {
        return self::create([
            'user_id' => $userId,
            'titre' => 'Alerte zone de danger',
            'message' => "La zone {$zone->nom} présente un niveau de risque élevé ({$zone->niveau_risque}%)",
            'type' => $type,
            'donnees' => ['zone_id' => $zone->id],
            'action_url' => "/zones/{$zone->id}",
        ]);
    }
}
















