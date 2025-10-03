<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZoneDanger extends Model
{
    use HasFactory;

    protected $table = 'zones_danger';

    protected $fillable = [
        'nom',
        'latitude_centre',
        'longitude_centre',
        'rayon',
        'type',
        'niveau_risque',
        'nombre_alertes',
        'population',
        'dernier_incident',
        'facteurs_risque',
        'recommandations',
        'actions_effectuees',
    ];

    protected $casts = [
        'dernier_incident' => 'datetime',
        'facteurs_risque' => 'array',
        'recommandations' => 'array',
        'actions_effectuees' => 'array',
    ];

    // Scopes
    public function scopeCritiques($query)
    {
        return $query->where('type', 'critical');
    }

    public function scopeMoyennes($query)
    {
        return $query->where('type', 'medium');
    }

    public function scopeSecurisees($query)
    {
        return $query->where('type', 'safe');
    }

    public function scopeParNiveauRisque($query, $niveau)
    {
        return $query->where('niveau_risque', '>=', $niveau);
    }

    // Méthodes utiles
    public function ajouterAction($action, $details = null)
    {
        $actions = $this->actions_effectuees ?? [];
        $actions[] = [
            'action' => $action,
            'details' => $details,
            'date' => now()->toISOString(),
        ];

        $this->update(['actions_effectuees' => $actions]);
    }

    public function ajouterRecommandation($recommandation)
    {
        $recommandations = $this->recommandations ?? [];
        if (!in_array($recommandation, $recommandations)) {
            $recommandations[] = $recommandation;
            $this->update(['recommandations' => $recommandations]);
        }
    }

    public function calculerNiveauRisque()
    {
        // Calculer le niveau de risque basé sur les signalements récents
        $signalementsRecents = Signalement::where('date_signalement', '>=', now()->subDays(7))
            ->dansZone($this->latitude_centre, $this->longitude_centre, $this->rayon)
            ->get();

        $score = 0;
        
        // Basé sur le nombre d'alertes
        $score += min($signalementsRecents->count() * 5, 40);
        
        // Basé sur la gravité des signalements
        $score += $signalementsRecents->where('niveau', 'danger-critical')->count() * 20;
        $score += $signalementsRecents->where('niveau', 'danger-medium')->count() * 10;
        
        // Basé sur la population (plus de population = plus de risque)
        $score += min($this->population / 100, 20);
        
        // Basé sur le temps depuis le dernier incident
        $joursDepuisIncident = now()->diffInDays($this->dernier_incident);
        if ($joursDepuisIncident < 1) $score += 20;
        elseif ($joursDepuisIncident < 3) $score += 10;
        elseif ($joursDepuisIncident < 7) $score += 5;

        $niveauRisque = min(max($score, 0), 100);
        
        // Déterminer le type
        if ($niveauRisque >= 80) $type = 'critical';
        elseif ($niveauRisque >= 50) $type = 'medium';
        else $type = 'safe';

        $this->update([
            'niveau_risque' => $niveauRisque,
            'type' => $type,
            'nombre_alertes' => $signalementsRecents->count(),
        ]);

        return $niveauRisque;
    }

    public function genererRecommandations()
    {
        $recommandations = [];
        
        if ($this->niveau_risque >= 80) {
            $recommandations = [
                'Augmenter les patrouilles',
                'Éclairage public renforcé',
                'Caméras de surveillance',
                'Intervention rapide nécessaire',
            ];
        } elseif ($this->niveau_risque >= 50) {
            $recommandations = [
                'Patrouilles régulières',
                'Surveillance renforcée',
                'Formation des commerçants',
            ];
        } else {
            $recommandations = [
                'Surveillance préventive',
                'Maintenance de l\'éclairage',
            ];
        }

        $this->update(['recommandations' => $recommandations]);
        return $recommandations;
    }

    public function getSignalementsDansZone()
    {
        return Signalement::dansZone($this->latitude_centre, $this->longitude_centre, $this->rayon)
            ->where('date_signalement', '>=', now()->subDays(30))
            ->get();
    }
}
