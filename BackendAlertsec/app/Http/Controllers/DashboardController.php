<?php

namespace App\Http\Controllers;

use App\Models\Signalement;
use App\Models\User;
use App\Models\ZoneDanger;
use App\Models\AgentTracking;
use App\Models\Communication;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Statistiques générales
        $stats = $this->getGeneralStats();

        // Statistiques spécifiques selon le rôle
        $roleStats = match($user->role) {
            'admin', 'superviseur' => $this->getAdminStats(),
            'agent' => $this->getAgentStats($user),
            'citoyen' => $this->getCitoyenStats($user),
            default => []
        };

        // Données récentes
        $recentData = $this->getRecentData($user);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'nom_complet' => $user->nom_complet,
                    'role' => $user->role,
                    'grade' => $user->grade,
                    'unite' => $user->unite,
                ],
                'statistiques_generales' => $stats,
                'statistiques_role' => $roleStats,
                'donnees_recentes' => $recentData,
            ]
        ]);
    }

    public function getSignalementsStats(Request $request)
    {
        $query = Signalement::query();

        // Filtres de date
        if ($request->filled('date_debut')) {
            $query->whereDate('date_signalement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_signalement', '<=', $request->date_fin);
        }

        $signalements = $query->get();

        $stats = [
            'total' => $signalements->count(),
            'par_status' => $signalements->groupBy('status')->map->count(),
            'par_niveau' => $signalements->groupBy('niveau')->map->count(),
            'par_type' => $signalements->groupBy('type')->map->count(),
            'par_priorite' => $signalements->groupBy('priorite')->map->count(),
            'taux_traitement' => $signalements->count() > 0 ? 
                round(($signalements->where('status', 'traité')->count() / $signalements->count()) * 100, 2) : 0,
            'temps_moyen_traitement' => $this->calculerTempsMoyenTraitement($signalements),
            'evolution_temps' => $this->getEvolutionTemps($signalements),
            'par_jour' => $this->getStatsParJour($signalements),
            'par_heure' => $this->getStatsParHeure($signalements),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getAgentsStats(Request $request)
    {
        $agents = User::agents()->get();

        $stats = [
            'total_agents' => $agents->count(),
            'agents_actifs' => $agents->where('statut', 'actif')->count(),
            'agents_disponibles' => $agents->where('statut', 'actif')->where('charge_travail', '<', 5)->count(),
            'agents_en_mission' => AgentTracking::enMission()->count(),
            'agents_hors_ligne' => AgentTracking::horsLigne()->count(),
            'charge_travail_moyenne' => $agents->avg('charge_travail'),
            'taux_reussite_moyen' => $agents->avg('taux_reussite'),
            'temps_intervention_moyen' => $agents->avg('temps_moyen_intervention'),
            'par_unite' => $agents->groupBy('unite')->map->count(),
            'par_secteur' => $agents->groupBy('secteur')->map->count(),
            'par_experience' => $agents->groupBy(function($agent) {
                if ($agent->experience >= 10) return 'Senior (10+ ans)';
                if ($agent->experience >= 5) return 'Intermédiaire (5-9 ans)';
                if ($agent->experience >= 2) return 'Junior (2-4 ans)';
                return 'Débutant (< 2 ans)';
            })->map->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getZonesStats(Request $request)
    {
        $zones = ZoneDanger::all();

        $stats = [
            'total_zones' => $zones->count(),
            'zones_critiques' => $zones->where('type', 'critical')->count(),
            'zones_moyennes' => $zones->where('type', 'medium')->count(),
            'zones_securisees' => $zones->where('type', 'safe')->count(),
            'niveau_risque_moyen' => $zones->avg('niveau_risque'),
            'population_totale' => $zones->sum('population'),
            'alertes_total' => $zones->sum('nombre_alertes'),
            'evolution_risque' => $this->getEvolutionRisqueZones($zones),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getAlerts(Request $request)
    {
        $user = $request->user();

        // Signalements critiques non traités
        $signalementsCritiques = Signalement::critiques()
            ->nonTraites()
            ->with(['citoyen'])
            ->orderBy('date_signalement', 'desc')
            ->limit(10)
            ->get();

        // Zones à risque élevé
        $zonesRisque = ZoneDanger::where('niveau_risque', '>=', 80)
            ->orderBy('niveau_risque', 'desc')
            ->limit(5)
            ->get();

        // Agents en difficulté
        $agentsDifficulte = User::agents()
            ->where('charge_travail', '>=', 4)
            ->with(['dernierePosition'])
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'signalements_critiques' => $signalementsCritiques,
                'zones_risque' => $zonesRisque,
                'agents_difficulte' => $agentsDifficulte,
            ]
        ]);
    }

    public function getMapData(Request $request)
    {
        // Signalements récents (dernières 24h)
        $signalements = Signalement::where('date_signalement', '>=', now()->subDay())
            ->with(['citoyen', 'agentAssigne'])
            ->get()
            ->map(function ($signalement) {
                return [
                    'id' => $signalement->id,
                    'type' => 'signalement',
                    'latitude' => $signalement->latitude,
                    'longitude' => $signalement->longitude,
                    'niveau' => $signalement->niveau,
                    'type_signalement' => $signalement->type,
                    'status' => $signalement->status,
                    'adresse' => $signalement->adresse,
                    'date' => $signalement->date_signalement,
                    'agent_assigne' => $signalement->agentAssigne?->nom_complet,
                ];
            });

        // Positions des agents
        $agents = AgentTracking::enLigne()
            ->with(['agent'])
            ->get()
            ->groupBy('agent_id')
            ->map(function ($trackings) {
                $latest = $trackings->first();
                return [
                    'id' => $latest->agent->id,
                    'type' => 'agent',
                    'latitude' => $latest->latitude,
                    'longitude' => $latest->longitude,
                    'nom' => $latest->agent->nom_complet,
                    'grade' => $latest->agent->grade,
                    'statut' => $latest->statut_mission,
                    'vitesse' => $latest->vitesse,
                    'batterie' => $latest->batterie,
                    'en_mission' => $latest->signalement_id !== null,
                ];
            });

        // Zones de danger
        $zones = ZoneDanger::all()
            ->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'type' => 'zone',
                    'latitude' => $zone->latitude_centre,
                    'longitude' => $zone->longitude_centre,
                    'rayon' => $zone->rayon,
                    'nom' => $zone->nom,
                    'niveau_risque' => $zone->niveau_risque,
                    'type_zone' => $zone->type,
                    'population' => $zone->population,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'signalements' => $signalements,
                'agents' => $agents->values(),
                'zones' => $zones,
            ]
        ]);
    }

    // Méthodes privées
    private function getGeneralStats()
    {
        return [
            'total_signalements' => Signalement::count(),
            'signalements_critiques' => Signalement::critiques()->count(),
            'signalements_en_cours' => Signalement::enCours()->count(),
            'total_agents' => User::agents()->count(),
            'agents_disponibles' => User::agents()->disponibles()->count(),
            'total_zones' => ZoneDanger::count(),
            'zones_critiques' => ZoneDanger::critiques()->count(),
        ];
    }

    private function getAdminStats()
    {
        return [
            'taux_traitement_global' => $this->calculerTauxTraitement(),
            'temps_moyen_intervention' => $this->calculerTempsMoyenIntervention(),
            'charge_travail_moyenne' => User::agents()->avg('charge_travail'),
            'niveau_risque_moyen' => ZoneDanger::avg('niveau_risque'),
            'communications_recentes' => Communication::with(['user', 'signalement'])
                ->latest()
                ->limit(10)
                ->get(),
        ];
    }

    private function getAgentStats($user)
    {
        $signalementsAssignes = $user->signalementsAssignes();
        
        return [
            'mes_signalements' => $signalementsAssignes->count(),
            'en_cours' => $signalementsAssignes->enCours()->count(),
            'traites' => $signalementsAssignes->traites()->count(),
            'charge_travail' => $user->charge_travail,
            'taux_reussite' => $user->taux_reussite,
            'temps_moyen_intervention' => $user->temps_moyen_intervention,
            'derniere_position' => $user->dernierePosition,
        ];
    }

    private function getCitoyenStats($user)
    {
        $signalementsEnvoyes = $user->signalementsEnvoyes();
        
        return [
            'mes_signalements' => $signalementsEnvoyes->count(),
            'en_cours' => $signalementsEnvoyes->enCours()->count(),
            'traites' => $signalementsEnvoyes->traites()->count(),
            'dernier_signalement' => $signalementsEnvoyes->latest()->first(),
        ];
    }

    private function getRecentData($user)
    {
        $data = [];

        if ($user->isAdmin() || $user->isSuperviseur()) {
            $data = [
                'signalements_recents' => Signalement::with(['citoyen', 'agentAssigne'])
                    ->latest()
                    ->limit(10)
                    ->get(),
                'communications_recentes' => Communication::with(['user', 'signalement'])
                    ->latest()
                    ->limit(10)
                    ->get(),
                'zones_risque' => ZoneDanger::where('niveau_risque', '>=', 70)
                    ->orderBy('niveau_risque', 'desc')
                    ->limit(5)
                    ->get(),
            ];
        } elseif ($user->isAgent()) {
            $data = [
                'mes_signalements_recents' => $user->signalementsAssignes()
                    ->with(['citoyen'])
                    ->latest()
                    ->limit(10)
                    ->get(),
                'missions_en_cours' => AgentTracking::where('agent_id', $user->id)
                    ->enMission()
                    ->with(['signalement'])
                    ->get(),
            ];
        } elseif ($user->isCitoyen()) {
            $data = [
                'mes_signalements_recents' => $user->signalementsEnvoyes()
                    ->with(['agentAssigne'])
                    ->latest()
                    ->limit(10)
                    ->get(),
                'communications_recentes' => Communication::whereHas('signalement', function($query) use ($user) {
                    $query->where('citoyen_id', $user->id);
                })->with(['user'])
                ->latest()
                ->limit(10)
                ->get(),
            ];
        }

        return $data;
    }

    private function calculerTauxTraitement()
    {
        $total = Signalement::count();
        if ($total === 0) return 0;
        
        $traites = Signalement::traites()->count();
        return round(($traites / $total) * 100, 2);
    }

    private function calculerTempsMoyenIntervention()
    {
        $signalements = Signalement::traites()
            ->whereNotNull('date_assignation')
            ->whereNotNull('date_traitement')
            ->get();

        if ($signalements->isEmpty()) return 0;

        $tempsTotal = $signalements->sum(function ($signalement) {
            return $signalement->date_assignation->diffInMinutes($signalement->date_traitement);
        });

        return round($tempsTotal / $signalements->count(), 2);
    }

    private function calculerTempsMoyenTraitement($signalements)
    {
        $signalementsTraites = $signalements->where('status', 'traité')
            ->whereNotNull('date_assignation')
            ->whereNotNull('date_traitement');

        if ($signalementsTraites->isEmpty()) {
            return 0;
        }

        $tempsTotal = 0;
        foreach ($signalementsTraites as $signalement) {
            $tempsTotal += $signalement->date_assignation->diffInMinutes($signalement->date_traitement);
        }

        return round($tempsTotal / $signalementsTraites->count(), 2);
    }

    private function getEvolutionTemps($signalements)
    {
        $evolution = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = $signalements->filter(function ($signalement) use ($date) {
                return $signalement->date_signalement->format('Y-m-d') === $date;
            })->count();
            
            $evolution[] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return $evolution;
    }

    private function getStatsParJour($signalements)
    {
        return $signalements->groupBy(function ($signalement) {
            return $signalement->date_signalement->format('l'); // Jour de la semaine
        })->map->count();
    }

    private function getStatsParHeure($signalements)
    {
        return $signalements->groupBy(function ($signalement) {
            return $signalement->date_signalement->format('H'); // Heure
        })->map->count();
    }

    private function getEvolutionRisqueZones($zones)
    {
        // Simulation de l'évolution (en réalité, il faudrait stocker l'historique)
        return $zones->map(function ($zone) {
            return [
                'zone_id' => $zone->id,
                'zone_nom' => $zone->nom,
                'niveau_actuel' => $zone->niveau_risque,
                'tendance' => rand(0, 1) ? 'en_hausse' : 'en_baisse',
                'variation' => rand(-10, 10),
            ];
        });
    }
}

