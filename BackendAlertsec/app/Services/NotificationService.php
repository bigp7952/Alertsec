<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\Signalement;
use App\Models\AgentTracking;
use App\Models\Communication;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    /**
     * Envoyer une notification push via FCM
     */
    public function sendPushNotification($userId, $title, $message, $data = [])
    {
        $user = User::find($userId);
        if (!$user || !$user->fcm_token) {
            return false;
        }

        $payload = [
            'to' => $user->fcm_token,
            'notification' => [
                'title' => $title,
                'body' => $message,
                'sound' => 'default',
                'badge' => $this->getUnreadCount($userId)
            ],
            'data' => array_merge($data, [
                'type' => 'alertsec_notification',
                'timestamp' => now()->toISOString()
            ])
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'key=' . config('services.fcm.server_key'),
                'Content-Type' => 'application/json'
            ])->post('https://fcm.googleapis.com/fcm/send', $payload);

            if ($response->successful()) {
                Log::info('Push notification envoyée', [
                    'user_id' => $userId,
                    'title' => $title,
                    'response' => $response->json()
                ]);
                return true;
            } else {
                Log::error('Erreur envoi push notification', [
                    'user_id' => $userId,
                    'response' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception envoi push notification', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Notifier un nouveau signalement
     */
    public function notifyNewSignalement(Signalement $signalement)
    {
        $title = 'Nouveau signalement - ' . ucfirst($signalement->type);
        $message = "Signalement de {$signalement->type} - Priorité {$signalement->priorite}";
        
        $data = [
            'signalement_id' => $signalement->id,
            'type' => 'new_signalement',
            'priority' => $signalement->priorite
        ];

        // Notifier les superviseurs
        $superviseurs = User::where('role', 'superviseur')->get();
        foreach ($superviseurs as $superviseur) {
            $this->createNotification($superviseur->id, $title, $message, 'error', $data);
            $this->sendPushNotification($superviseur->id, $title, $message, $data);
        }

        // Notifier l'admin
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            $this->createNotification($admin->id, $title, $message, 'error', $data);
            $this->sendPushNotification($admin->id, $title, $message, $data);
        }

        // Si un agent est assigné, le notifier
        if ($signalement->agent_assigne_id) {
            $agentTitle = 'Mission assignée';
            $agentMessage = "Un nouveau signalement vous a été assigné";
            $this->createNotification($signalement->agent_assigne_id, $agentTitle, $agentMessage, 'info', $data);
            $this->sendPushNotification($signalement->agent_assigne_id, $agentTitle, $agentMessage, $data);
        }
    }

    /**
     * Notifier la mise à jour d'un signalement
     */
    public function notifySignalementUpdate(Signalement $signalement)
    {
        $title = 'Mise à jour signalement';
        $message = "Votre signalement est maintenant {$signalement->status}";
        
        $data = [
            'signalement_id' => $signalement->id,
            'type' => 'signalement_update',
            'status' => $signalement->status
        ];

        // Notifier le citoyen
        $this->createNotification($signalement->citoyen_id, $title, $message, 'info', $data);
        $this->sendPushNotification($signalement->citoyen_id, $title, $message, $data);

        // Notifier les superviseurs
        $superviseurs = User::where('role', 'superviseur')->get();
        foreach ($superviseurs as $superviseur) {
            $superviseurMessage = "Signalement #{$signalement->id} - Statut: {$signalement->status}";
            $this->createNotification($superviseur->id, $title, $superviseurMessage, 'info', $data);
            $this->sendPushNotification($superviseur->id, $title, $superviseurMessage, $data);
        }
    }

    /**
     * Notifier un nouveau message
     */
    public function notifyNewMessage(Communication $communication)
    {
        $signalement = $communication->signalement;
        $destinataireId = $communication->envoyeur === 'citoyen' 
            ? $signalement->agent_assigne_id 
            : $signalement->citoyen_id;

        if (!$destinataireId) return;

        $title = 'Nouveau message';
        $message = "Vous avez reçu un nouveau message";
        
        $data = [
            'signalement_id' => $signalement->id,
            'communication_id' => $communication->id,
            'type' => 'new_message'
        ];

        $this->createNotification($destinataireId, $title, $message, 'info', $data);
        $this->sendPushNotification($destinataireId, $title, $message, $data);
    }

    /**
     * Notifier la mise à jour de position d'un agent
     */
    public function notifyAgentLocationUpdate(User $agent, AgentTracking $tracking)
    {
        $title = 'Position agent mise à jour';
        $message = "Agent {$agent->nom} {$agent->prenom} - Position mise à jour";
        
        $data = [
            'agent_id' => $agent->id,
            'type' => 'agent_location_update',
            'latitude' => $tracking->latitude,
            'longitude' => $tracking->longitude,
            'status' => $tracking->status
        ];

        // Notifier les superviseurs
        $superviseurs = User::where('role', 'superviseur')->get();
        foreach ($superviseurs as $superviseur) {
            $this->createNotification($superviseur->id, $title, $message, 'info', $data);
            // Pas de push pour les mises à jour de position trop fréquentes
        }
    }

    /**
     * Notifier une alerte critique
     */
    public function notifyCriticalAlert($title, $message, $data = [])
    {
        $allUsers = User::whereIn('role', ['admin', 'superviseur', 'agent'])->get();
        
        foreach ($allUsers as $user) {
            $this->createNotification($user->id, $title, $message, 'error', $data);
            $this->sendPushNotification($user->id, $title, $message, $data);
        }
    }

    /**
     * Notifier une zone de danger critique
     */
    public function notifyDangerZoneAlert($zoneId, $title, $message)
    {
        $data = [
            'zone_id' => $zoneId,
            'type' => 'danger_zone_alert'
        ];

        $this->notifyCriticalAlert($title, $message, $data);
    }

    /**
     * Créer une notification en base
     */
    public function createNotification($userId, $title, $message, $type = 'info', $data = [])
    {
        return Notification::create([
            'user_id' => $userId,
            'titre' => $title,
            'message' => $message,
            'type' => $type,
            'donnees' => $data,
            'lu' => false
        ]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead($userId)
    {
        return Notification::where('user_id', $userId)
            ->where('lu', false)
            ->update(['lu' => true]);
    }

    /**
     * Obtenir le nombre de notifications non lues
     */
    public function getUnreadCount($userId)
    {
        return Notification::where('user_id', $userId)
            ->where('lu', false)
            ->count();
    }

    /**
     * Obtenir les notifications récentes
     */
    public function getRecentNotifications($userId, $limit = 10)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Nettoyer les anciennes notifications
     */
    public function cleanupOldNotifications($days = 30)
    {
        $cutoffDate = now()->subDays($days);
        
        return Notification::where('created_at', '<', $cutoffDate)
            ->where('lu', true)
            ->delete();
    }

    /**
     * Envoyer une notification de test
     */
    public function sendTestNotification($userId)
    {
        $title = 'Test AlertSec';
        $message = 'Ceci est une notification de test';
        $data = ['type' => 'test'];

        $this->createNotification($userId, $title, $message, 'info', $data);
        return $this->sendPushNotification($userId, $title, $message, $data);
    }

    /**
     * Notifier l'assignation automatique d'un agent
     */
    public function notifyAutoAssignment(Signalement $signalement, User $agent)
    {
        $title = 'Assignation automatique';
        $message = "Agent {$agent->nom} {$agent->prenom} assigné au signalement #{$signalement->id}";
        
        $data = [
            'signalement_id' => $signalement->id,
            'agent_id' => $agent->id,
            'type' => 'auto_assignment'
        ];

        // Notifier l'agent
        $this->createNotification($agent->id, $title, $message, 'info', $data);
        $this->sendPushNotification($agent->id, $title, $message, $data);

        // Notifier les superviseurs
        $superviseurs = User::where('role', 'superviseur')->get();
        foreach ($superviseurs as $superviseur) {
            $this->createNotification($superviseur->id, $title, $message, 'info', $data);
        }
    }

    /**
     * Notifier une urgence critique
     */
    public function notifyEmergencyAlert(Signalement $signalement)
    {
        $title = '🚨 URGENCE CRITIQUE 🚨';
        $message = "Signalement critique de {$signalement->type} - Intervention immédiate requise";
        
        $data = [
            'signalement_id' => $signalement->id,
            'type' => 'emergency_alert',
            'priority' => $signalement->priorite,
            'location' => $signalement->adresse
        ];

        // Notifier tous les agents disponibles
        $agents = User::where('role', 'agent')
            ->where('statut', 'actif')
            ->get();

        foreach ($agents as $agent) {
            $agentMessage = "URGENCE: {$signalement->type} à {$signalement->adresse}";
            $this->createNotification($agent->id, $title, $agentMessage, 'error', $data);
            $this->sendPushNotification($agent->id, $title, $agentMessage, $data);
        }

        // Notifier les superviseurs et admin
        $this->notifyCriticalAlert($title, $message, $data);
    }
}










