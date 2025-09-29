<?php

namespace App\Services;

use App\Models\Signalement;
use App\Models\User;
use App\Models\AgentTracking;
use App\Models\Communication;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Services\TrackingService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RealtimeSyncService
{
    protected $notificationService;
    protected $trackingService;

    public function __construct(NotificationService $notificationService, TrackingService $trackingService)
    {
        $this->notificationService = $notificationService;
        $this->trackingService = $trackingService;
    }

    /**
     * Synchroniser les données en temps réel
     */
    public function syncRealtimeData()
    {
        $syncData = [
            'timestamp' => now()->toISOString(),
            'signalements' => $this->getSignalementsUpdates(),
            'agents' => $this->getAgentsUpdates(),
            'communications' => $this->getCommunicationsUpdates(),
            'notifications' => $this->getNotificationsUpdates(),
            'zones' => $this->getZonesUpdates(),
        ];

        // Mettre en cache les données de synchronisation
        Cache::put('realtime_sync_data', $syncData, 60); // Cache 1 minute

        return $syncData;
    }

    /**
     * Obtenir les mises à jour des signalements
     */
    public function getSignalementsUpdates()
    {
        $lastSync = Cache::get('last_signalements_sync', now()->subHour());
        
        $signalements = Signalement::with(['citoyen', 'agentAssigne', 'communications'])
            ->where('updated_at', '>', $lastSync)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Mettre à jour le timestamp de la dernière synchronisation
        if ($signalements->isNotEmpty()) {
            Cache::put('last_signalements_sync', now(), 3600);
        }

        return $signalements->map(function ($signalement) {
            return [
                'id' => $signalement->id,
                'type' => 'signalement_update',
                'action' => $this->determineSignalementAction($signalement),
                'data' => $signalement,
                'timestamp' => $signalement->updated_at->toISOString(),
            ];
        });
    }

    /**
     * Obtenir les mises à jour des agents
     */
    public function getAgentsUpdates()
    {
        $lastSync = Cache::get('last_agents_sync', now()->subMinutes(5));
        
        $agents = AgentTracking::with('agent')
            ->where('derniere_activite', '>', $lastSync)
            ->orderBy('derniere_activite', 'desc')
            ->get();

        // Mettre à jour le timestamp de la dernière synchronisation
        if ($agents->isNotEmpty()) {
            Cache::put('last_agents_sync', now(), 300);
        }

        return $agents->map(function ($tracking) {
            return [
                'id' => $tracking->id,
                'type' => 'agent_position_update',
                'agent_id' => $tracking->agent_id,
                'data' => $tracking,
                'timestamp' => $tracking->derniere_activite->toISOString(),
            ];
        });
    }

    /**
     * Obtenir les mises à jour des communications
     */
    public function getCommunicationsUpdates()
    {
        $lastSync = Cache::get('last_communications_sync', now()->subMinutes(2));
        
        $communications = Communication::with(['user', 'signalement'])
            ->where('created_at', '>', $lastSync)
            ->orderBy('created_at', 'desc')
            ->get();

        // Mettre à jour le timestamp de la dernière synchronisation
        if ($communications->isNotEmpty()) {
            Cache::put('last_communications_sync', now(), 120);
        }

        return $communications->map(function ($communication) {
            return [
                'id' => $communication->id,
                'type' => 'new_communication',
                'signalement_id' => $communication->signalement_id,
                'data' => $communication,
                'timestamp' => $communication->created_at->toISOString(),
            ];
        });
    }

    /**
     * Obtenir les mises à jour des notifications
     */
    public function getNotificationsUpdates()
    {
        $lastSync = Cache::get('last_notifications_sync', now()->subMinutes(1));
        
        $notifications = Notification::with('user')
            ->where('created_at', '>', $lastSync)
            ->orderBy('created_at', 'desc')
            ->get();

        // Mettre à jour le timestamp de la dernière synchronisation
        if ($notifications->isNotEmpty()) {
            Cache::put('last_notifications_sync', now(), 60);
        }

        return $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => 'new_notification',
                'user_id' => $notification->user_id,
                'data' => $notification,
                'timestamp' => $notification->created_at->toISOString(),
            ];
        });
    }

    /**
     * Obtenir les mises à jour des zones de danger
     */
    public function getZonesUpdates()
    {
        $lastSync = Cache::get('last_zones_sync', now()->subMinutes(10));
        
        $zones = \App\Models\ZoneDanger::where('updated_at', '>', $lastSync)
            ->orderBy('updated_at', 'desc')
            ->get();

        // Mettre à jour le timestamp de la dernière synchronisation
        if ($zones->isNotEmpty()) {
            Cache::put('last_zones_sync', now(), 600);
        }

        return $zones->map(function ($zone) {
            return [
                'id' => $zone->id,
                'type' => 'zone_update',
                'data' => $zone,
                'timestamp' => $zone->updated_at->toISOString(),
            ];
        });
    }

    /**
     * Synchroniser un signalement spécifique
     */
    public function syncSignalement($signalementId)
    {
        $signalement = Signalement::with(['citoyen', 'agentAssigne', 'communications', 'medias'])
            ->find($signalementId);

        if (!$signalement) {
            return null;
        }

        return [
            'id' => $signalement->id,
            'type' => 'signalement_sync',
            'data' => $signalement,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Synchroniser un agent spécifique
     */
    public function syncAgent($agentId)
    {
        $tracking = AgentTracking::with('agent')
            ->where('agent_id', $agentId)
            ->first();

        if (!$tracking) {
            return null;
        }

        return [
            'id' => $tracking->id,
            'type' => 'agent_sync',
            'agent_id' => $agentId,
            'data' => $tracking,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Obtenir les données du dashboard en temps réel
     */
    public function getDashboardData()
    {
        $cacheKey = 'dashboard_realtime_data';
        $cachedData = Cache::get($cacheKey);
        
        if ($cachedData && now()->diffInSeconds($cachedData['timestamp']) < 30) {
            return $cachedData['data'];
        }

        $dashboardData = [
            'timestamp' => now()->toISOString(),
            'stats' => $this->getDashboardStats(),
            'recent_signalements' => $this->getRecentSignalements(),
            'active_agents' => $this->getActiveAgents(),
            'critical_zones' => $this->getCriticalZones(),
            'system_status' => $this->getSystemStatus(),
        ];

        Cache::put($cacheKey, [
            'data' => $dashboardData,
            'timestamp' => now(),
        ], 30);

        return $dashboardData;
    }

    /**
     * Obtenir les statistiques du dashboard
     */
    private function getDashboardStats()
    {
        return [
            'total_signalements' => Signalement::count(),
            'signalements_en_cours' => Signalement::where('status', 'en cours')->count(),
            'signalements_traites' => Signalement::where('status', 'traité')->count(),
            'signalements_critiques' => Signalement::where('priorite', 'critique')->count(),
            'agents_actifs' => AgentTracking::where('is_online', true)->count(),
            'agents_en_mission' => AgentTracking::where('is_online', true)
                ->whereNotNull('signalement_id')
                ->count(),
            'zones_critiques' => \App\Models\ZoneDanger::where('niveau_risque', '>', 70)->count(),
            'notifications_non_lues' => Notification::where('lu', false)->count(),
        ];
    }

    /**
     * Obtenir les signalements récents
     */
    private function getRecentSignalements()
    {
        return Signalement::with(['citoyen', 'agentAssigne'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Obtenir les agents actifs
     */
    private function getActiveAgents()
    {
        return AgentTracking::with('agent')
            ->where('is_online', true)
            ->where('derniere_activite', '>', now()->subMinutes(15))
            ->get();
    }

    /**
     * Obtenir les zones critiques
     */
    private function getCriticalZones()
    {
        return \App\Models\ZoneDanger::where('niveau_risque', '>', 70)
            ->orderBy('niveau_risque', 'desc')
            ->limit(5)
            ->get();
    }

    /**
     * Obtenir le statut du système
     */
    private function getSystemStatus()
    {
        return [
            'api_status' => 'online',
            'database_status' => $this->checkDatabaseConnection(),
            'cache_status' => $this->checkCacheStatus(),
            'last_sync' => now()->toISOString(),
            'uptime' => $this->getSystemUptime(),
        ];
    }

    /**
     * Vérifier la connexion à la base de données
     */
    private function checkDatabaseConnection()
    {
        try {
            DB::connection()->getPdo();
            return 'online';
        } catch (\Exception $e) {
            return 'offline';
        }
    }

    /**
     * Vérifier le statut du cache
     */
    private function checkCacheStatus()
    {
        try {
            Cache::put('health_check', 'ok', 10);
            return Cache::get('health_check') === 'ok' ? 'online' : 'offline';
        } catch (\Exception $e) {
            return 'offline';
        }
    }

    /**
     * Obtenir le temps de fonctionnement du système
     */
    private function getSystemUptime()
    {
        // Implémentation simplifiée - vous pouvez utiliser des outils plus sophistiqués
        $startTime = Cache::get('system_start_time', now());
        return now()->diffInMinutes($startTime);
    }

    /**
     * Déterminer l'action du signalement
     */
    private function determineSignalementAction(Signalement $signalement)
    {
        $lastUpdate = $signalement->updated_at;
        $createdAt = $signalement->created_at;

        // Si créé récemment (dans les 5 dernières minutes)
        if ($lastUpdate->diffInMinutes($createdAt) < 5) {
            return 'created';
        }

        // Si assigné récemment
        if ($signalement->date_assignation && 
            $signalement->date_assignation->diffInMinutes($lastUpdate) < 5) {
            return 'assigned';
        }

        // Si traité récemment
        if ($signalement->date_traitement && 
            $signalement->date_traitement->diffInMinutes($lastUpdate) < 5) {
            return 'completed';
        }

        // Sinon, mise à jour générale
        return 'updated';
    }

    /**
     * Diffuser une mise à jour à tous les clients connectés
     */
    public function broadcastUpdate($type, $data, $targetUsers = null)
    {
        $update = [
            'type' => $type,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'target_users' => $targetUsers,
        ];

        // Ici vous pourriez utiliser Laravel Broadcasting, WebSockets, ou Server-Sent Events
        // Pour l'instant, on met en cache pour que les clients puissent le récupérer
        Cache::put("broadcast_{$type}_" . now()->timestamp, $update, 60);

        Log::info("Broadcast update sent", [
            'type' => $type,
            'target_users' => $targetUsers,
        ]);
    }

    /**
     * Obtenir les mises à jour en attente pour un utilisateur
     */
    public function getPendingUpdatesForUser($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return [];
        }

        $updates = [];

        // Récupérer les notifications non lues
        $notifications = Notification::where('user_id', $userId)
            ->where('lu', false)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($notifications as $notification) {
            $updates[] = [
                'type' => 'notification',
                'data' => $notification,
                'timestamp' => $notification->created_at->toISOString(),
            ];
        }

        // Si c'est un agent, récupérer les mises à jour de ses signalements
        if ($user->role === 'agent') {
            $signalements = Signalement::where('agent_assigne_id', $userId)
                ->where('updated_at', '>', now()->subMinutes(10))
                ->get();

            foreach ($signalements as $signalement) {
                $updates[] = [
                    'type' => 'signalement_update',
                    'data' => $signalement,
                    'timestamp' => $signalement->updated_at->toISOString(),
                ];
            }
        }

        return $updates;
    }

    /**
     * Nettoyer les anciennes données de synchronisation
     */
    public function cleanupOldSyncData()
    {
        $keys = [
            'last_signalements_sync',
            'last_agents_sync',
            'last_communications_sync',
            'last_notifications_sync',
            'last_zones_sync',
            'dashboard_realtime_data',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }

        Log::info('Old sync data cleaned up');
    }
}

