<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AgentTracking;
use App\Models\Signalement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::agents()->with(['dernierePosition']);

        // Filtres
        if ($request->filled('secteur')) {
            $query->where('secteur', $request->secteur);
        }

        if ($request->filled('unite')) {
            $query->where('unite', $request->unite);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('disponible')) {
            if ($request->disponible) {
                $query->disponibles();
            }
        }

        $agents = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $agents
        ]);
    }

    public function show($id)
    {
        $agent = User::agents()
            ->with(['dernierePosition', 'signalementsAssignes.mediasFiles'])
            ->findOrFail($id);

        // Statistiques de l'agent
        $statistiques = [
            'signalements_total' => $agent->signalementsAssignes()->count(),
            'signalements_en_cours' => $agent->signalementsAssignes()->enCours()->count(),
            'signalements_traites' => $agent->signalementsAssignes()->traites()->count(),
            'taux_reussite' => $agent->taux_reussite,
            'temps_moyen_intervention' => $agent->temps_moyen_intervention,
            'charge_travail_actuelle' => $agent->charge_travail,
            'derniere_activite' => $agent->dernierePosition?->derniere_activite,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'agent' => $agent,
                'statistiques' => $statistiques
            ]
        ]);
    }

    public function updatePosition(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'vitesse' => 'nullable|numeric|min:0',
            'direction' => 'nullable|numeric|between:0,360',
            'batterie' => 'nullable|integer|between:0,100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Créer un nouveau point de tracking
        $tracking = AgentTracking::mettreAJourPosition(
            $user->id,
            $request->latitude,
            $request->longitude,
            $request->vitesse,
            $request->direction,
            $request->batterie
        );

        return response()->json([
            'success' => true,
            'message' => 'Position mise à jour',
            'data' => $tracking
        ]);
    }

    public function getPosition($id)
    {
        $agent = User::agents()->findOrFail($id);
        $position = $agent->dernierePosition;

        if (!$position) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune position trouvée pour cet agent'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $position
        ]);
    }

    public function getPositions(Request $request)
    {
        $query = AgentTracking::with(['agent']);

        if ($request->filled('agent_ids')) {
            $agentIds = explode(',', $request->agent_ids);
            $query->whereIn('agent_id', $agentIds);
        }

        if ($request->filled('en_ligne')) {
            $query->where('is_online', $request->boolean('en_ligne'));
        }

        if ($request->filled('en_mission')) {
            if ($request->en_mission) {
                $query->enMission();
            } else {
                $query->disponibles();
            }
        }

        $positions = $query->latest('derniere_activite')
            ->get()
            ->groupBy('agent_id')
            ->map(function ($trackings) {
                return $trackings->first(); // Prendre la position la plus récente
            });

        return response()->json([
            'success' => true,
            'data' => $positions->values()
        ]);
    }

    public function startMission(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'signalement_id' => 'required|exists:signalements,id',
            'duree_minutes' => 'nullable|integer|min:30|max:480', // 30min à 8h
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $agent = User::agents()->findOrFail($id);
        $signalement = Signalement::findOrFail($request->signalement_id);

        // Vérifier que l'agent est assigné à ce signalement
        if ($signalement->agent_assigne_id !== $agent->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cet agent n\'est pas assigné à ce signalement'
            ], 400);
        }

        // Démarrer la mission
        $tracking = AgentTracking::demarrerMission(
            $agent->id,
            $request->signalement_id,
            $request->duree_minutes ?? 120
        );

        return response()->json([
            'success' => true,
            'message' => 'Mission démarrée',
            'data' => $tracking
        ]);
    }

    public function endMission(Request $request, $id)
    {
        $agent = User::agents()->findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur() && $user->id !== $agent->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $missionEnCours = AgentTracking::where('agent_id', $agent->id)
            ->whereNotNull('signalement_id')
            ->latest()
            ->first();

        if (!$missionEnCours) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune mission en cours'
            ], 400);
        }

        // Terminer la mission
        $missionEnCours->update([
            'signalement_id' => null,
            'fin_mission_prevue' => now(),
        ]);

        // Mettre à jour les statistiques de l'agent
        $tempsMission = $missionEnCours->debut_mission->diffInMinutes(now());
        $this->mettreAJourStatistiquesAgent($agent, $tempsMission);

        return response()->json([
            'success' => true,
            'message' => 'Mission terminée',
            'data' => [
                'temps_mission' => $tempsMission,
                'mission' => $missionEnCours
            ]
        ]);
    }

    public function getTrackingHistory(Request $request, $id)
    {
        $agent = User::agents()->findOrFail($id);

        $query = AgentTracking::where('agent_id', $agent->id);

        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $history = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function getAgentStats(Request $request, $id)
    {
        $agent = User::agents()->findOrFail($id);

        $query = Signalement::where('agent_assigne_id', $agent->id);

        if ($request->filled('periode')) {
            $jours = match($request->periode) {
                'semaine' => 7,
                'mois' => 30,
                'trimestre' => 90,
                default => 30
            };
            $query->where('date_signalement', '>=', now()->subDays($jours));
        }

        $signalements = $query->get();

        $stats = [
            'total_signalements' => $signalements->count(),
            'en_cours' => $signalements->where('status', 'en cours')->count(),
            'traites' => $signalements->where('status', 'traité')->count(),
            'taux_traitement' => $signalements->count() > 0 ? 
                round(($signalements->where('status', 'traité')->count() / $signalements->count()) * 100, 2) : 0,
            'temps_moyen_intervention' => $this->calculerTempsMoyen($signalements),
            'signalements_par_type' => $signalements->groupBy('type')->map->count(),
            'signalements_par_priorite' => $signalements->groupBy('priorite')->map->count(),
            'evolution_temps' => $this->calculerEvolutionTemps($signalements),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function updateAgent(Request $request, $id)
    {
        $agent = User::agents()->findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier les agents'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'grade' => 'sometimes|string|max:255',
            'unite' => 'sometimes|string|max:255',
            'secteur' => 'sometimes|string|max:255',
            'specialites' => 'nullable|array',
            'experience' => 'nullable|integer|min:0',
            'distance_max' => 'nullable|integer|min:1|max:100',
            'statut' => 'sometimes|in:actif,inactif,suspendu',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $agent->update($request->only([
            'grade', 'unite', 'secteur', 'specialites', 
            'experience', 'distance_max', 'statut'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Agent mis à jour avec succès',
            'data' => $agent->load(['dernierePosition'])
        ]);
    }

    // Méthodes privées
    private function mettreAJourStatistiquesAgent($agent, $tempsMission)
    {
        $signalementsTraites = $agent->signalementsAssignes()->traites()->count();
        
        if ($signalementsTraites > 0) {
            // Calculer le nouveau temps moyen
            $tempsTotal = $agent->temps_moyen_intervention * ($signalementsTraites - 1) + $tempsMission;
            $nouveauTempsMoyen = round($tempsTotal / $signalementsTraites, 2);
            
            // Calculer le taux de réussite (simplifié)
            $tauxReussite = min(100, $agent->taux_reussite + 1);
            
            $agent->update([
                'temps_moyen_intervention' => $nouveauTempsMoyen,
                'taux_reussite' => $tauxReussite,
            ]);
        }
    }

    private function calculerTempsMoyen($signalements)
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

    private function calculerEvolutionTemps($signalements)
    {
        $signalementsTraites = $signalements->where('status', 'traité')
            ->whereNotNull('date_assignation')
            ->whereNotNull('date_traitement')
            ->sortBy('date_traitement');

        $evolution = [];
        $tempsTotal = 0;
        $count = 0;

        foreach ($signalementsTraites as $signalement) {
            $tempsMission = $signalement->date_assignation->diffInMinutes($signalement->date_traitement);
            $tempsTotal += $tempsMission;
            $count++;
            
            $evolution[] = [
                'date' => $signalement->date_traitement->format('Y-m-d'),
                'temps_moyen' => round($tempsTotal / $count, 2),
                'temps_mission' => $tempsMission
            ];
        }

        return $evolution;
    }
}

