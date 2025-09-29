<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'grade',
        'unite',
        'secteur',
        'role',
        'email',
        'password',
        'code_service',
        'avatar',
        'derniere_connexion',
        'statut',
        'telephone',
        'adresse',
        'specialites',
        'experience',
        'charge_travail',
        'distance_max',
        'taux_reussite',
        'temps_moyen_intervention',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'derniere_connexion' => 'datetime',
        'specialites' => 'array',
        'password' => 'hashed',
    ];

    // Relations
    public function signalementsEnvoyes()
    {
        return $this->hasMany(Signalement::class, 'citoyen_id');
    }

    public function signalementsAssignes()
    {
        return $this->hasMany(Signalement::class, 'agent_assigne_id');
    }

    public function communications()
    {
        return $this->hasMany(Communication::class);
    }

    public function tracking()
    {
        return $this->hasMany(AgentTracking::class, 'agent_id');
    }

    public function dernierePosition()
    {
        return $this->hasOne(AgentTracking::class, 'agent_id')->latest();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeAgents($query)
    {
        return $query->where('role', 'agent');
    }

    public function scopeCitoyens($query)
    {
        return $query->where('role', 'citoyen');
    }

    public function scopeDisponibles($query)
    {
        return $query->where('statut', 'actif')
                    ->where('charge_travail', '<', 5); // Maximum 5 signalements
    }

    public function scopeParSecteur($query, $secteur)
    {
        return $query->where('secteur', $secteur);
    }

    // Méthodes utiles
    public function isAgent()
    {
        return $this->role === 'agent';
    }

    public function isCitoyen()
    {
        return $this->role === 'citoyen';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSuperviseur()
    {
        return $this->role === 'superviseur';
    }

    public function getNomCompletAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }

    public function calculerDistance($latitude, $longitude)
    {
        $lat1 = deg2rad($this->dernierePosition->latitude ?? 0);
        $lon1 = deg2rad($this->dernierePosition->longitude ?? 0);
        $lat2 = deg2rad($latitude);
        $lon2 = deg2rad($longitude);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        $a = sin($dlat/2) * sin($dlat/2) + cos($lat1) * cos($lat2) * sin($dlon/2) * sin($dlon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));

        return 6371 * $c; // Distance en km
    }
}