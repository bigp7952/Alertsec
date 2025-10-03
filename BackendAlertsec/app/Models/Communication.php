<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Communication extends Model
{
    use HasFactory;

    protected $fillable = [
        'signalement_id',
        'user_id',
        'type',
        'contenu',
        'envoyeur',
        'lu',
        'date_lecture',
        'pieces_jointes',
    ];

    protected $casts = [
        'date_lecture' => 'datetime',
        'pieces_jointes' => 'array',
    ];

    // Relations
    public function signalement()
    {
        return $this->belongsTo(Signalement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopeParType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeParSignalement($query, $signalementId)
    {
        return $query->where('signalement_id', $signalementId);
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
}

