<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SignalementController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\ZoneDangerController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RealTimeController;
use App\Http\Controllers\ApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques (sans authentification)
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

// Routes API unifiées pour mobile et web
Route::prefix('mobile')->middleware('auth:sanctum')->group(function () {
    // Authentification et profil
    Route::post('/login', [ApiController::class, 'login']);
    Route::post('/logout', [ApiController::class, 'logout']);
    Route::get('/profile', [ApiController::class, 'profile']);
    
    // Position GPS des agents
    Route::post('/location/update', [ApiController::class, 'updateLocation']);
    
    // Signalements pour agents
    Route::get('/signalements', [ApiController::class, 'getAgentSignalements']);
    Route::post('/signalements/{id}/status', [ApiController::class, 'updateSignalementStatus']);
    
    // Création de signalements par citoyens
    Route::post('/signalements/create', [ApiController::class, 'createSignalement']);
    
    // Notifications
    Route::get('/notifications', [ApiController::class, 'getNotifications']);
    Route::put('/notifications/{id}/read', [ApiController::class, 'markNotificationRead']);
    
    // Communications
    Route::get('/signalements/{id}/communications', [ApiController::class, 'getCommunications']);
    Route::post('/signalements/{id}/message', [ApiController::class, 'sendMessage']);
    
    // Upload de médias
    Route::post('/signalements/{id}/media', [ApiController::class, 'uploadMedia']);
    
    // Positions des agents (pour superviseurs)
    Route::get('/agents/positions', [ApiController::class, 'getAgentPositions']);
    
    // Zones de danger
    Route::get('/zones/danger', [ApiController::class, 'getDangerZones']);
});

// Routes protégées par authentification
Route::middleware(['auth:sanctum', 'user.status'])->group(function () {
    
    // Authentification
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });

    // Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('signalements-stats', [DashboardController::class, 'getSignalementsStats']);
        Route::get('agents-stats', [DashboardController::class, 'getAgentsStats']);
        Route::get('zones-stats', [DashboardController::class, 'getZonesStats']);
        Route::get('alerts', [DashboardController::class, 'getAlerts']);
        Route::get('map-data', [DashboardController::class, 'getMapData']);
    });

    // Signalements
    Route::prefix('signalements')->group(function () {
        Route::get('/', [SignalementController::class, 'index']);
        Route::post('/', [SignalementController::class, 'store']);
        Route::get('{id}', [SignalementController::class, 'show']);
        Route::put('{id}', [SignalementController::class, 'update']);
        Route::delete('{id}', [SignalementController::class, 'destroy']);
        Route::get('statistiques/general', [SignalementController::class, 'statistiques']);
        
        // Assignation d'agents
        Route::post('{id}/assigner', [SignalementController::class, 'assigner'])
            ->middleware('role:admin|superviseur');
        Route::post('{id}/assignation-automatique', [SignalementController::class, 'assignationAutomatique'])
            ->middleware('role:admin|superviseur');
    });

    // Agents
    Route::prefix('agents')->group(function () {
        Route::get('/', [AgentController::class, 'index']);
        Route::get('{id}', [AgentController::class, 'show']);
        Route::put('{id}', [AgentController::class, 'updateAgent'])
            ->middleware('role:admin|superviseur');
        
        // Tracking des agents
        Route::post('position/update', [AgentController::class, 'updatePosition'])
            ->middleware('role:agent');
        Route::get('position/{id}', [AgentController::class, 'getPosition']);
        Route::get('positions', [AgentController::class, 'getPositions']);
        Route::get('{id}/tracking-history', [AgentController::class, 'getTrackingHistory']);
        Route::get('{id}/stats', [AgentController::class, 'getAgentStats']);
        
        // Missions
        Route::post('{id}/start-mission', [AgentController::class, 'startMission'])
            ->middleware('role:admin|superviseur');
        Route::post('{id}/end-mission', [AgentController::class, 'endMission']);
    });

    // Communications
    Route::prefix('communications')->group(function () {
        Route::get('/', [CommunicationController::class, 'index']);
        Route::post('/', [CommunicationController::class, 'store']);
        Route::get('{id}', [CommunicationController::class, 'show']);
        Route::put('{id}', [CommunicationController::class, 'update']);
        Route::delete('{id}', [CommunicationController::class, 'destroy']);
        
        // Messages par signalement
        Route::get('signalement/{signalementId}', [CommunicationController::class, 'getBySignalement']);
        Route::post('mark-all-read', [CommunicationController::class, 'markAllAsRead']);
        Route::post('{id}/mark-read', [CommunicationController::class, 'markAsRead']);
        Route::get('unread-count', [CommunicationController::class, 'getUnreadCount']);
        Route::get('conversations', [CommunicationController::class, 'getConversations']);
    });

    // Zones de danger
    Route::prefix('zones')->group(function () {
        Route::get('/', [ZoneDangerController::class, 'index']);
        Route::post('/', [ZoneDangerController::class, 'store'])
            ->middleware('role:admin|superviseur');
        Route::get('{id}', [ZoneDangerController::class, 'show']);
        Route::put('{id}', [ZoneDangerController::class, 'update'])
            ->middleware('role:admin|superviseur');
        Route::delete('{id}', [ZoneDangerController::class, 'destroy'])
            ->middleware('role:admin');
        
        // Actions sur les zones
        Route::post('{id}/calculate-risk', [ZoneDangerController::class, 'calculateRisk'])
            ->middleware('role:admin|superviseur');
        Route::post('{id}/add-action', [ZoneDangerController::class, 'addAction'])
            ->middleware('role:admin|superviseur');
        Route::post('{id}/add-recommendation', [ZoneDangerController::class, 'addRecommendation'])
            ->middleware('role:admin|superviseur');
        Route::post('{id}/assign-agents', [ZoneDangerController::class, 'assignAgents'])
            ->middleware('role:admin|superviseur');
        Route::get('{id}/generate-report', [ZoneDangerController::class, 'generateReport'])
            ->middleware('role:admin|superviseur');
        
        // Calcul automatique
        Route::post('auto-calculate', [ZoneDangerController::class, 'autoCalculateZones'])
            ->middleware('role:admin|superviseur');
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('{id}', [NotificationController::class, 'show']);
        Route::post('{id}/mark-read', [NotificationController::class, 'markAsRead']);
        Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::get('unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::get('recent', [NotificationController::class, 'getRecent']);
        Route::delete('{id}', [NotificationController::class, 'delete']);
        Route::delete('all', [NotificationController::class, 'deleteAll']);
        Route::get('stats', [NotificationController::class, 'getStats']);
        
        // Création et diffusion (admin/superviseur uniquement)
        Route::post('create', [NotificationController::class, 'create'])
            ->middleware('role:admin|superviseur');
        Route::post('broadcast', [NotificationController::class, 'broadcast'])
            ->middleware('role:admin');
    });

    // Gestion des utilisateurs (admin uniquement)
    Route::prefix('users')->middleware('role:admin')->group(function () {
        Route::get('/', function () {
            return response()->json([
                'success' => true,
                'message' => 'Endpoint pour la gestion des utilisateurs - À implémenter'
            ]);
        });
    });

    // Gestion des médias
    Route::prefix('media')->group(function () {
        Route::get('signalement/{signalementId}', function ($signalementId) {
            $signalement = \App\Models\Signalement::findOrFail($signalementId);
            return response()->json([
                'success' => true,
                'data' => $signalement->mediasFiles
            ]);
        });
    });

    // Temps réel
    Route::prefix('realtime')->group(function () {
        Route::get('dashboard-data', [RealTimeController::class, 'getDashboardData']);
        Route::get('signalements-updates', [RealTimeController::class, 'getSignalementsUpdates']);
        Route::get('agents-positions', [RealTimeController::class, 'getAgentsPositions']);
        Route::get('communications-updates', [RealTimeController::class, 'getCommunicationsUpdates']);
        Route::get('notifications-updates', [RealTimeController::class, 'getNotificationsUpdates']);
        Route::get('zones-updates', [RealTimeController::class, 'getZonesUpdates']);
        Route::post('subscribe', [RealTimeController::class, 'subscribeToUpdates']);
        Route::get('system-status', [RealTimeController::class, 'getSystemStatus']);
        
        // Broadcasting (admin/superviseur uniquement)
        Route::post('broadcast/signalement/{id}', [RealTimeController::class, 'broadcastSignalementUpdate'])
            ->middleware('role:admin|superviseur');
        Route::post('broadcast/agent/{id}', [RealTimeController::class, 'broadcastAgentPositionUpdate'])
            ->middleware('role:admin|superviseur');
        Route::post('broadcast/zone/{id}', [RealTimeController::class, 'broadcastZoneUpdate'])
            ->middleware('role:admin|superviseur');
    });

    // Routes de test (à supprimer en production)
    Route::prefix('test')->group(function () {
        Route::get('user', function (Request $request) {
            return response()->json([
                'success' => true,
                'data' => $request->user()
            ]);
        });
        
        Route::get('roles', function (Request $request) {
            $user = $request->user();
            return response()->json([
                'success' => true,
                'data' => [
                    'role' => $user->role,
                    'is_admin' => $user->isAdmin(),
                    'is_superviseur' => $user->isSuperviseur(),
                    'is_agent' => $user->isAgent(),
                    'is_citoyen' => $user->isCitoyen(),
                ]
            ]);
        });
    });
});

// Routes pour les tests de santé de l'API
Route::get('health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API AlertSec fonctionnelle',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// Routes de fallback pour les erreurs 404
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint non trouvé'
    ], 404);
});