<?php

namespace App\Http\Controllers;

use App\Models\ZoneDanger;
use App\Models\Signalement;
use App\Models\User;
use Illuminate\Http\Request;
use App\Events\ZoneDangerMiseAJour;
use Illuminate\Support\Facades\Validator;

class ZoneDangerController extends Controller
{
    public function index(Request $request)
    {
        $query = ZoneDanger::query();

        // Filtres
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('niveau_risque_min')) {
            $query->where('niveau_risque', '>=', $request->niveau_risque_min);
        }

        if ($request->filled('niveau_risque_max')) {
            $query->where('niveau_risque', '<=', $request->niveau_risque_max);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('dernier_incident', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('dernier_incident', '<=', $request->date_fin);
        }

        $zones = $query->orderBy('niveau_risque', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $zones
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'latitude_centre' => 'required|numeric|between:-90,90',
            'longitude_centre' => 'required|numeric|between:-180,180',
            'rayon' => 'required|integer|min:100|max:5000', // 100m à 5km
            'population' => 'nullable|integer|min:0',
            'facteurs_risque' => 'nullable|array',
            'recommandations' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Seuls admin et superviseurs peuvent créer des zones
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à créer des zones de danger'
            ], 403);
        }

        $zone = ZoneDanger::create([
            'nom' => $request->nom,
            'latitude_centre' => $request->latitude_centre,
            'longitude_centre' => $request->longitude_centre,
            'rayon' => $request->rayon,
            'population' => $request->population ?? 0,
            'facteurs_risque' => $request->facteurs_risque ?? [],
            'recommandations' => $request->recommandations ?? [],
            'dernier_incident' => now(),
        ]);

        // Calculer automatiquement le niveau de risque
        $zone->calculerNiveauRisque();
        $zone->genererRecommandations();

        return response()->json([
            'success' => true,
            'message' => 'Zone de danger créée avec succès',
            'data' => $zone
        ], 201);
    }

    public function show($id)
    {
        $zone = ZoneDanger::findOrFail($id);

        // Récupérer les signalements dans cette zone
        $signalements = $zone->getSignalementsDansZone();

        // Statistiques de la zone
        $statistiques = [
            'total_signalements' => $signalements->count(),
            'signalements_critiques' => $signalements->where('niveau', 'danger-critical')->count(),
            'signalements_moyens' => $signalements->where('niveau', 'danger-medium')->count(),
            'signalements_surs' => $signalements->where('niveau', 'safe-zone')->count(),
            'signalements_par_type' => $signalements->groupBy('type')->map->count(),
            'dernier_incident' => $signalements->max('date_signalement'),
            'tendance' => $this->calculerTendance($signalements),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'zone' => $zone,
                'signalements' => $signalements,
                'statistiques' => $statistiques
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent modifier les zones
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier les zones de danger'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'latitude_centre' => 'sometimes|numeric|between:-90,90',
            'longitude_centre' => 'sometimes|numeric|between:-180,180',
            'rayon' => 'sometimes|integer|min:100|max:5000',
            'population' => 'nullable|integer|min:0',
            'facteurs_risque' => 'nullable|array',
            'recommandations' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $zone->update($request->only([
            'nom', 'latitude_centre', 'longitude_centre', 'rayon',
            'population', 'facteurs_risque', 'recommandations'
        ]));

        // Recalculer le niveau de risque si nécessaire
        if ($request->hasAny(['latitude_centre', 'longitude_centre', 'rayon'])) {
            $zone->calculerNiveauRisque();
            $zone->genererRecommandations();
        }

        try { event(new ZoneDangerMiseAJour($zone)); } catch (\Throwable $e) { }

        return response()->json([
            'success' => true,
            'message' => 'Zone de danger mise à jour avec succès',
            'data' => $zone
        ]);
    }

    public function calculateRisk(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent recalculer
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $ancienNiveau = $zone->niveau_risque;
        $nouveauNiveau = $zone->calculerNiveauRisque();
        $recommandations = $zone->genererRecommandations();

        return response()->json([
            'success' => true,
            'message' => 'Niveau de risque recalculé',
            'data' => [
                'zone' => $zone,
                'ancien_niveau' => $ancienNiveau,
                'nouveau_niveau' => $nouveauNiveau,
                'variation' => $nouveauNiveau - $ancienNiveau,
                'recommandations' => $recommandations
            ]
        ]);
    }

    public function addAction(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent ajouter des actions
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|string|max:255',
            'details' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $zone->ajouterAction($request->action, $request->details);

        return response()->json([
            'success' => true,
            'message' => 'Action ajoutée avec succès',
            'data' => $zone
        ]);
    }

    public function addRecommendation(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent ajouter des recommandations
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'recommandation' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $zone->ajouterRecommandation($request->recommandation);

        return response()->json([
            'success' => true,
            'message' => 'Recommandation ajoutée avec succès',
            'data' => $zone
        ]);
    }

    public function assignAgents(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent assigner des agents
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'agent_ids' => 'required|array',
            'agent_ids.*' => 'exists:users,id',
            'duree_minutes' => 'nullable|integer|min:30|max:480',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $agentsAssignes = [];
        $duree = $request->duree_minutes ?? 120;

        foreach ($request->agent_ids as $agentId) {
            $agent = User::agents()->findOrFail($agentId);
            
            // Créer une mission de surveillance de la zone
            \App\Models\AgentTracking::create([
                'agent_id' => $agent->id,
                'latitude' => $zone->latitude_centre,
                'longitude' => $zone->longitude_centre,
                'debut_mission' => now(),
                'fin_mission_prevue' => now()->addMinutes($duree),
                'is_online' => true,
                'derniere_activite' => now(),
            ]);

            $agentsAssignes[] = $agent;

            // Notifier l'agent
            \App\Models\Notification::create([
                'user_id' => $agent->id,
                'titre' => 'Surveillance de zone assignée',
                'message' => "Vous avez été assigné à la surveillance de la zone {$zone->nom}",
                'type' => 'info',
                'donnees' => ['zone_id' => $zone->id],
                'action_url' => "/zones/{$zone->id}",
            ]);
        }

        // Ajouter une action à la zone
        $zone->ajouterAction('Agents assignés', 'Surveillance de zone avec ' . count($agentsAssignes) . ' agent(s)');

        return response()->json([
            'success' => true,
            'message' => 'Agents assignés avec succès',
            'data' => [
                'zone' => $zone,
                'agents_assignes' => $agentsAssignes,
                'duree_mission' => $duree
            ]
        ]);
    }

    public function generateReport(Request $request, $id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = $request->user();

        // Seuls admin et superviseurs peuvent générer des rapports
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $signalements = $zone->getSignalementsDansZone();
        
        $rapport = [
            'zone' => [
                'nom' => $zone->nom,
                'centre' => [
                    'latitude' => $zone->latitude_centre,
                    'longitude' => $zone->longitude_centre
                ],
                'rayon' => $zone->rayon,
                'niveau_risque' => $zone->niveau_risque,
                'type' => $zone->type,
                'population' => $zone->population,
            ],
            'statistiques' => [
                'total_signalements' => $signalements->count(),
                'signalements_critiques' => $signalements->where('niveau', 'danger-critical')->count(),
                'signalements_moyens' => $signalements->where('niveau', 'danger-medium')->count(),
                'signalements_surs' => $signalements->where('niveau', 'safe-zone')->count(),
                'dernier_incident' => $signalements->max('date_signalement'),
                'tendance' => $this->calculerTendance($signalements),
            ],
            'facteurs_risque' => $zone->facteurs_risque,
            'recommandations' => $zone->recommandations,
            'actions_effectuees' => $zone->actions_effectuees,
            'signalements_detaille' => $signalements->map(function ($signalement) {
                return [
                    'id' => $signalement->id,
                    'type' => $signalement->type,
                    'niveau' => $signalement->niveau,
                    'priorite' => $signalement->priorite,
                    'date' => $signalement->date_signalement,
                    'status' => $signalement->status,
                    'adresse' => $signalement->adresse,
                ];
            }),
            'generation_date' => now()->toISOString(),
            'generated_by' => $user->nom_complet,
        ];

        return response()->json([
            'success' => true,
            'data' => $rapport
        ]);
    }

    public function autoCalculateZones(Request $request)
    {
        $user = $request->user();

        // Seuls admin et superviseurs peuvent recalculer toutes les zones
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $zones = ZoneDanger::all();
        $resultats = [];

        foreach ($zones as $zone) {
            $ancienNiveau = $zone->niveau_risque;
            $nouveauNiveau = $zone->calculerNiveauRisque();
            $zone->genererRecommandations();

            $resultats[] = [
                'zone_id' => $zone->id,
                'zone_nom' => $zone->nom,
                'ancien_niveau' => $ancienNiveau,
                'nouveau_niveau' => $nouveauNiveau,
                'variation' => $nouveauNiveau - $ancienNiveau,
                'type' => $zone->type,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Calcul automatique terminé',
            'data' => $resultats
        ]);
    }

    public function destroy($id)
    {
        $zone = ZoneDanger::findOrFail($id);
        $user = request()->user();

        // Seuls admin peuvent supprimer les zones
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à supprimer les zones de danger'
            ], 403);
        }

        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Zone de danger supprimée avec succès'
        ]);
    }

    // Méthodes privées
    private function calculerTendance($signalements)
    {
        $aujourdhui = $signalements->where('date_signalement', '>=', now()->subDay())->count();
        $hier = $signalements->whereBetween('date_signalement', [now()->subDays(2), now()->subDay()])->count();
        $semaine_derniere = $signalements->whereBetween('date_signalement', [now()->subDays(7), now()->subDays(2)])->count();

        if ($aujourdhui > $hier && $hier > $semaine_derniere) {
            return 'en_hausse';
        } elseif ($aujourdhui < $hier && $hier < $semaine_derniere) {
            return 'en_baisse';
        } else {
            return 'stable';
        }
    }
}





