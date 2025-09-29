<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\RealtimeSyncService;
use App\Services\NotificationService;
use App\Services\TrackingService;
use Illuminate\Support\Facades\Auth;

class RealtimeController extends Controller
{
    protected $syncService;
    protected $notificationService;
    protected $trackingService;

    public function __construct(
        RealtimeSyncService $syncService,
        NotificationService $notificationService,
        TrackingService $trackingService
    ) {
        $this->syncService = $syncService;
        $this->notificationService = $notificationService;
        $this->trackingService = $trackingService;
    }

    /**
     * Obtenir toutes les données temps réel
     */
    public function getDashboardData()
    {
        try {
            $data = $this->syncService->getDashboardData();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des données temps réel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les mises à jour des signalements
     */
    public function getSignalementsUpdates(Request $request)
    {
        try {
            $lastSync = $request->query('last_sync');
            $updates = $this->syncService->getSignalementsUpdates();
            
            // Filtrer par timestamp si fourni
            if ($lastSync) {
                $updates = $updates->filter(function ($update) use ($lastSync) {
                    return $update['timestamp'] > $lastSync;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $updates->values(),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des mises à jour des signalements',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les mises à jour des positions des agents
     */
    public function getAgentsPositions(Request $request)
    {
        try {
            $lastSync = $request->query('last_sync');
            $updates = $this->syncService->getAgentsUpdates();
            
            // Filtrer par timestamp si fourni
            if ($lastSync) {
                $updates = $updates->filter(function ($update) use ($lastSync) {
                    return $update['timestamp'] > $lastSync;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $updates->values(),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des positions des agents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les mises à jour des communications
     */
    public function getCommunicationsUpdates(Request $request)
    {
        try {
            $lastSync = $request->query('last_sync');
            $updates = $this->syncService->getCommunicationsUpdates();
            
            // Filtrer par timestamp si fourni
            if ($lastSync) {
                $updates = $updates->filter(function ($update) use ($lastSync) {
                    return $update['timestamp'] > $lastSync;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $updates->values(),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des communications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les mises à jour des notifications
     */
    public function getNotificationsUpdates(Request $request)
    {
        try {
            $user = Auth::user();
            $lastSync = $request->query('last_sync');
            
            $updates = $this->syncService->getNotificationsUpdates();
            
            // Filtrer par utilisateur
            $updates = $updates->filter(function ($update) use ($user) {
                return $update['user_id'] === $user->id;
            });
            
            // Filtrer par timestamp si fourni
            if ($lastSync) {
                $updates = $updates->filter(function ($update) use ($lastSync) {
                    return $update['timestamp'] > $lastSync;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $updates->values(),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les mises à jour des zones de danger
     */
    public function getZonesUpdates(Request $request)
    {
        try {
            $lastSync = $request->query('last_sync');
            $updates = $this->syncService->getZonesUpdates();
            
            // Filtrer par timestamp si fourni
            if ($lastSync) {
                $updates = $updates->filter(function ($update) use ($lastSync) {
                    return $update['timestamp'] > $lastSync;
                });
            }

            return response()->json([
                'success' => true,
                'data' => $updates->values(),
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des zones de danger',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Synchroniser un signalement spécifique
     */
    public function syncSignalement($id)
    {
        try {
            $data = $this->syncService->syncSignalement($id);
            
            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'Signalement non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la synchronisation du signalement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Synchroniser un agent spécifique
     */
    public function syncAgent($id)
    {
        try {
            $data = $this->syncService->syncAgent($id);
            
            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la synchronisation de l\'agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir toutes les mises à jour en attente pour l'utilisateur connecté
     */
    public function getPendingUpdates(Request $request)
    {
        try {
            $user = Auth::user();
            $updates = $this->syncService->getPendingUpdatesForUser($user->id);

            return response()->json([
                'success' => true,
                'data' => $updates,
                'timestamp' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des mises à jour en attente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * S'abonner aux mises à jour
     */
    public function subscribeToUpdates(Request $request)
    {
        try {
            $user = Auth::user();
            $subscriptionData = $request->only(['signalements', 'agents', 'communications', 'notifications', 'zones']);
            
            // Ici vous pourriez implémenter un système d'abonnement plus sophistiqué
            // avec WebSockets ou Server-Sent Events
            
            return response()->json([
                'success' => true,
                'message' => 'Abonnement aux mises à jour réussi',
                'data' => [
                    'user_id' => $user->id,
                    'subscriptions' => $subscriptionData,
                    'timestamp' => now()->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'abonnement aux mises à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le statut du système
     */
    public function getSystemStatus()
    {
        try {
            $status = $this->syncService->getDashboardData()['system_status'];

            return response()->json([
                'success' => true,
                'data' => $status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du statut du système',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Diffuser une mise à jour (admin/superviseur uniquement)
     */
    public function broadcast(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'superviseur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $request->validate([
                'type' => 'required|string',
                'data' => 'required|array',
                'target_users' => 'nullable|array'
            ]);

            $this->syncService->broadcastUpdate(
                $request->type,
                $request->data,
                $request->target_users
            );

            return response()->json([
                'success' => true,
                'message' => 'Diffusion réussie'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la diffusion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Diffuser une mise à jour de signalement
     */
    public function broadcastSignalementUpdate($id)
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'superviseur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $signalement = \App\Models\Signalement::with(['citoyen', 'agentAssigne'])
                ->findOrFail($id);

            $this->syncService->broadcastUpdate('signalement_updated', $signalement);

            return response()->json([
                'success' => true,
                'message' => 'Mise à jour du signalement diffusée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la diffusion de la mise à jour du signalement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Diffuser une mise à jour de position d'agent
     */
    public function broadcastAgentPositionUpdate($id)
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'superviseur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $tracking = \App\Models\AgentTracking::with('agent')
                ->where('agent_id', $id)
                ->first();

            if (!$tracking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent non trouvé'
                ], 404);
            }

            $this->syncService->broadcastUpdate('agent_position_updated', $tracking);

            return response()->json([
                'success' => true,
                'message' => 'Mise à jour de position d\'agent diffusée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la diffusion de la mise à jour de position',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Diffuser une mise à jour de zone
     */
    public function broadcastZoneUpdate($id)
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'superviseur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $zone = \App\Models\ZoneDanger::findOrFail($id);

            $this->syncService->broadcastUpdate('zone_updated', $zone);

            return response()->json([
                'success' => true,
                'message' => 'Mise à jour de zone diffusée'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la diffusion de la mise à jour de zone',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Nettoyer les anciennes données de synchronisation
     */
    public function cleanupOldData()
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $this->syncService->cleanupOldSyncData();

            return response()->json([
                'success' => true,
                'message' => 'Nettoyage des anciennes données réussi'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du nettoyage',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}