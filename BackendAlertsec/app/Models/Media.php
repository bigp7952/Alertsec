<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;
    
    // Le nom de table réel est "medias" (et non l'irrégulier "media")
    protected $table = 'medias';

    protected $appends = [
        'url',
    ];

    protected $fillable = [
        'signalement_id',
        'nom_fichier',
        'chemin_fichier',
        'type_mime',
        'type_media',
        'taille_fichier',
        'latitude',
        'longitude',
        'date_capture',
        'metadonnees',
    ];

    protected $casts = [
        'date_capture' => 'datetime',
        'metadonnees' => 'array',
    ];

    // Relations
    public function signalement()
    {
        return $this->belongsTo(Signalement::class);
    }

    // Scopes
    public function scopePhotos($query)
    {
        return $query->where('type_media', 'photo');
    }

    public function scopeVideos($query)
    {
        return $query->where('type_media', 'video');
    }

    public function scopeAudios($query)
    {
        return $query->where('type_media', 'audio');
    }

    public function scopeParSignalement($query, $signalementId)
    {
        return $query->where('signalement_id', $signalementId);
    }

    // Méthodes utiles
    public function getUrlAttribute()
    {
        return Storage::url($this->chemin_fichier);
    }

    public function getFormattedSizeAttribute()
    {
        $bytes = $this->taille_fichier;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFormattedDurationAttribute()
    {
        if ($this->type_media === 'video' || $this->type_media === 'audio') {
            $duration = $this->metadonnees['duration'] ?? 0;
            $minutes = floor($duration / 60);
            $seconds = $duration % 60;
            return sprintf('%02d:%02d', $minutes, $seconds);
        }
        
        return null;
    }

    public static function creerMedia($signalementId, $fichier, $type, $metadonnees = [])
    {
        $extension = $fichier->getClientOriginalExtension();
        $nomFichier = time() . '_' . uniqid() . '.' . $extension;
        $chemin = "signalements/{$signalementId}/" . $nomFichier;
        
        Storage::putFileAs("signalements/{$signalementId}", $fichier, $nomFichier);
        
        return self::create([
            'signalement_id' => $signalementId,
            'nom_fichier' => $fichier->getClientOriginalName(),
            'chemin_fichier' => $chemin,
            'type_mime' => $fichier->getMimeType(),
            'type_media' => $type,
            'taille_fichier' => $fichier->getSize(),
            'metadonnees' => $metadonnees,
        ]);
    }
}






