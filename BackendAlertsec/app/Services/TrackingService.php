<?php

namespace App\Services;

use App\Models\User;
use App\Models\AgentTracking;
use App\Models\Signalement;
use App\Models\ZoneDanger;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TrackingService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Mettre à jour la position d'un agent
     */
    public function updateAgentPosition($agentId, $latitude, $longitude, $additionalData = [])
    {
        $agent = User::find($agentId);
        if (!$agent || $agent->role !== 'agent') {
            throw new \Exception('Agent non trouvé');
        }

        $trackingData = array_merge([
            'agent_id' => $agentId,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'derniere_activite' => now(),
            'is_online' => true
        ], $additionalData);

        $tracking = AgentTracking::updateOrCreate(
            ['agent_id' => $agentId],
            $trackingData
        );

        // Vérifier les zones de danger proches
        $this->checkNearbyDangerZones($tracking);

        // Mettre en cache la position pour les requêtes rapides
        Cache::put("agent_position_{$agentId}", $tracking, 300); // 5 minutes

        // Notifier les superviseurs si nécessaire
        $this->notificationService->notifyAgentLocationUpdate($agent, $tracking);

        // Vérifier les signalements proches
        $this->checkNearbySignalements($tracking);

        return $tracking;
    }

    /**
     * Obtenir la position actuelle d'un agent
     */
    public function getAgentPosition($agentId)
    {
        // Essayer d'abord le cache
        $cachedPosition = Cache::get("agent_position_{$agentId}");
        if ($cachedPosition) {
            return $cachedPosition;
        }

        // Sinon récupérer de la base
        $tracking = AgentTracking::where('agent_id', $agentId)
            ->where('is_online', true)
            ->first();

        if ($tracking) {
            Cache::put("agent_position_{$agentId}", $tracking, 300);
        }

        return $tracking;
    }

    /**
     * Obtenir toutes les positions des agents actifs
     */
    public function getAllAgentPositions()
    {
        $cacheKey = 'all_agent_positions';
        $cachedPositions = Cache::get($cacheKey);
        
        if ($cachedPositions) {
            return $cachedPositions;
        }

        $positions = AgentTracking::with('agent')
            ->where('is_online', true)
            ->where('derniere_activite', '>', now()->subMinutes(10))
            ->get();

        Cache::put($cacheKey, $positions, 60); // Cache 1 minute

        return $positions;
    }

    /**
     * Marquer un agent comme hors ligne
     */
    public function setAgentOffline($agentId)
    {
        $tracking = AgentTracking::where('agent_id', $agentId)->first();
        if ($tracking) {
            $tracking->update([
                'is_online' => false,
                'derniere_activite' => now()
            ]);

            Cache::forget("agent_position_{$agentId}");
            Cache::forget('all_agent_positions');

            Log::info("Agent {$agentId} marqué comme hors ligne");
        }
    }

    /**
     * Calculer la distance entre deux points GPS
     */
    public function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Rayon de la Terre en km
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) + 
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * 
             sin($dLon/2) * sin($dLon/2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }

    /**
     * Trouver l'agent le plus proche d'un point
     */
    public function findNearestAgent($latitude, $longitude, $maxDistance = 50)
    {
        $agents = AgentTracking::with('agent')
            ->where('is_online', true)
            ->where('derniere_activite', '>', now()->subMinutes(15))
            ->get();

        $nearestAgent = null;
        $minDistance = $maxDistance;

        foreach ($agents as $tracking) {
            $distance = $this->calculateDistance(
                $latitude, $longitude,
                $tracking->latitude, $tracking->longitude
            );

            if ($distance < $minDistance) {
                $minDistance = $distance;
                $nearestAgent = $tracking;
            }
        }

        return $nearestAgent ? [
            'agent' => $nearestAgent,
            'distance' => $minDistance
        ] : null;
    }

    /**
     * Vérifier les zones de danger proches
     */
    protected function checkNearbyDangerZones(AgentTracking $tracking)
    {
        $dangerZones = ZoneDanger::all();

        foreach ($dangerZones as $zone) {
            $distance = $this->calculateDistance(
                $tracking->latitude, $tracking->longitude,
                $zone->latitude_centre, $zone->longitude_centre
            );

            // Si l'agent entre dans une zone de danger
            if ($distance <= ($zone->rayon / 1000)) { // Convertir mètres en km
                $this->handleAgentInDangerZone($tracking, $zone);
            }
        }
    }

    /**
     * Gérer un agent dans une zone de danger
     */
    protected function handleAgentInDangerZone(AgentTracking $tracking, ZoneDanger $zone)
    {
        $agent = $tracking->agent;
        
        Log::warning("Agent {$agent->nom} {$agent->prenom} dans zone de danger", [
            'agent_id' => $agent->id,
            'zone_id' => $zone->id,
            'zone_name' => $zone->nom,
            'risk_level' => $zone->niveau_risque
        ]);

        // Notifier les superviseurs
        $this->notificationService->notifyCriticalAlert(
            'Agent en zone de danger',
            "Agent {$agent->nom} {$agent->prenom} se trouve dans la zone de danger: {$zone->nom}",
            [
                'agent_id' => $agent->id,
                'zone_id' => $zone->id,
                'type' => 'agent_in_danger_zone'
            ]
        );
    }

    /**
     * Vérifier les signalements proches
     */
    protected function checkNearbySignalements(AgentTracking $tracking)
    {
        $signalements = Signalement::where('status', 'non traité')
            ->where('created_at', '>', now()->subHours(2))
            ->get();

        foreach ($signalements as $signalement) {
            $distance = $this->calculateDistance(
                $tracking->latitude, $tracking->longitude,
                $signalement->latitude, $signalement->longitude
            );

            // Si l'agent est très proche d'un signalement non traité
            if ($distance <= 1) { // 1 km
                $this->handleAgentNearSignalement($tracking, $signalement, $distance);
            }
        }
    }

    /**
     * Gérer un agent proche d'un signalement
     */
    protected function handleAgentNearSignalement(AgentTracking $tracking, Signalement $signalement, $distance)
    {
        $agent = $tracking->agent;
        
        // Si l'agent n'est pas déjà assigné à ce signalement
        if ($signalement->agent_assigne_id !== $agent->id) {
            Log::info("Agent {$agent->nom} proche d'un signalement non assigné", [
                'agent_id' => $agent->id,
                'signalement_id' => $signalement->id,
                'distance' => $distance
            ]);

            // Suggérer l'assignation automatique
            $this->notificationService->createNotification(
                $agent->id,
                'Signalement proche détecté',
                "Un signalement non traité se trouve à " . round($distance, 2) . "km de votre position",
                'info',
                [
                    'signalement_id' => $signalement->id,
                    'distance' => $distance,
                    'type' => 'nearby_signalement'
                ]
            );
        }
    }

    /**
     * Obtenir l'historique de tracking d'un agent
     */
    public function getAgentTrackingHistory($agentId, $hours = 24)
    {
        return AgentTracking::where('agent_id', $agentId)
            ->where('derniere_activite', '>', now()->subHours($hours))
            ->orderBy('derniere_activite', 'desc')
            ->get();
    }

    /**
     * Calculer les statistiques de déplacement d'un agent
     */
    public function getAgentMovementStats($agentId, $hours = 24)
    {
        $trackingHistory = $this->getAgentTrackingHistory($agentId, $hours);
        
        if ($trackingHistory->count() < 2) {
            return [
                'total_distance' => 0,
                'average_speed' => 0,
                'max_speed' => 0,
                'movement_time' => 0,
                'stops_count' => 0
            ];
        }

        $totalDistance = 0;
        $speeds = [];
        $movementTime = 0;
        $stopsCount = 0;

        for ($i = 1; $i < $trackingHistory->count(); $i++) {
            $prev = $trackingHistory[$i];
            $curr = $trackingHistory[$i-1];

            $distance = $this->calculateDistance(
                $prev->latitude, $prev->longitude,
                $curr->latitude, $curr->longitude
            );

            $timeDiff = $curr->derniere_activite->diffInSeconds($prev->derniere_activite);
            
            if ($timeDiff > 0) {
                $speed = ($distance / $timeDiff) * 3600; // km/h
                $speeds[] = $speed;
                
                if ($speed < 1) { // Arrêt si vitesse < 1 km/h
                    $stopsCount++;
                } else {
                    $movementTime += $timeDiff;
                }
            }

            $totalDistance += $distance;
        }

        return [
            'total_distance' => round($totalDistance, 2),
            'average_speed' => count($speeds) > 0 ? round(array_sum($speeds) / count($speeds), 2) : 0,
            'max_speed' => count($speeds) > 0 ? round(max($speeds), 2) : 0,
            'movement_time' => $movementTime,
            'stops_count' => $stopsCount
        ];
    }

    /**
     * Vérifier la connectivité des agents
     */
    public function checkAgentConnectivity()
    {
        $offlineThreshold = now()->subMinutes(15);
        
        $agents = AgentTracking::where('derniere_activite', '<', $offlineThreshold)
            ->where('is_online', true)
            ->with('agent')
            ->get();

        foreach ($agents as $tracking) {
            $this->setAgentOffline($tracking->agent_id);
            
            Log::warning("Agent {$tracking->agent->nom} marqué hors ligne - pas de signal depuis 15min");
        }

        return $agents->count();
    }

    /**
     * Obtenir le statut de connectivité de tous les agents
     */
    public function getConnectivityStatus()
    {
        $onlineCount = AgentTracking::where('is_online', true)
            ->where('derniere_activite', '>', now()->subMinutes(5))
            ->count();

        $totalAgents = User::where('role', 'agent')
            ->where('statut', 'actif')
            ->count();

        return [
            'online' => $onlineCount,
            'total' => $totalAgents,
            'offline' => $totalAgents - $onlineCount,
            'connectivity_rate' => $totalAgents > 0 ? round(($onlineCount / $totalAgents) * 100, 2) : 0
        ];
    }
}





