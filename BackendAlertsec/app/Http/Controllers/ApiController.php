<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Signalement;
use App\Models\AgentTracking;
use App\Models\ZoneDanger;
use App\Models\Communication;
use App\Models\Notification;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ApiController extends Controller
{
    /**
     * Authentification et récupération du profil utilisateur
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('mobile-app')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Identifiants invalides'
        ], 401);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Récupération du profil utilisateur
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Mise à jour de la position GPS de l'agent
     */
    public function updateLocation(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'agent') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'vitesse' => 'nullable|numeric',
            'direction' => 'nullable|numeric',
            'batterie' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|string|in:disponible,en mission,en pause,hors ligne'
        ]);

        $tracking = AgentTracking::updateOrCreate(
            ['agent_id' => $user->id],
            [
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'vitesse' => $request->vitesse ?? 0,
                'direction' => $request->direction ?? 0,
                'batterie' => $request->batterie ?? 100,
                'is_online' => true,
                'derniere_activite' => now(),
                'status' => $request->status ?? 'disponible'
            ]
        );

        // Notifier les superviseurs de la mise à jour de position
        $this->notifyLocationUpdate($user, $tracking);

        return response()->json([
            'success' => true,
            'message' => 'Position mise à jour',
            'data' => $tracking
        ]);
    }

    /**
     * Récupération des signalements pour un agent
     */
    public function getAgentSignalements(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'agent') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $signalements = Signalement::with(['citoyen', 'agentAssigne', 'medias'])
            ->where('agent_assigne_id', $user->id)
            ->orderBy('date_signalement', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $signalements
        ]);
    }

    /**
     * Création d'un signalement par un citoyen
     */
    public function createSignalement(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'citoyen') {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'description' => 'required|string|max:1000',
            'type' => 'required|string|in:vol,agression,incendie,accident,autre',
            'priorite' => 'required|string|in:basse,moyenne,haute,critique',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'adresse' => 'required|string',
            'medias' => 'nullable|array',
            'medias.*' => 'file|mimes:jpg,jpeg,png,mp4,avi,mov,wav,mp3|max:10240'
        ]);

        // Créer le signalement
        $signalement = Signalement::create([
            'citoyen_id' => $user->id,
            'description' => $request->description,
            'type' => $request->type,
            'priorite' => $request->priorite,
            'niveau' => $this->determinerNiveau($request->priorite),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'adresse' => $request->adresse,
            'status' => 'non traité',
            'date_signalement' => now(),
            'heure' => now()->format('H:i:s'),
            'contact' => ['telephone' => $user->telephone]
        ]);

        // Gérer les médias
        if ($request->hasFile('medias')) {
            $this->handleMediaUpload($request->file('medias'), $signalement->id);
        }

        // Assignation automatique d'un agent
        $agent = $this->assignerAgentAutomatiquement($signalement);
        if ($agent) {
            $signalement->update([
                'agent_assigne_id' => $agent->id,
                'date_assignation' => now()
            ]);
        }

        // Notifier les superviseurs
        $this->notifyNewSignalement($signalement);

        return response()->json([
            'success' => true,
            'message' => 'Signalement créé avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'medias'])
        ]);
    }

    /**
     * Mise à jour du statut d'un signalement par un agent
     */
    public function updateSignalementStatus(Request $request, $id)
    {
        $user = $request->user();
        $signalement = Signalement::findOrFail($id);

        if ($signalement->agent_assigne_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'status' => 'required|string|in:en cours,traité,annulé',
            'notes_agent' => 'nullable|string|max:500'
        ]);

        $signalement->update([
            'status' => $request->status,
            'notes_agent' => $request->notes_agent,
            'date_traitement' => $request->status === 'traité' ? now() : null
        ]);

        // Notifier le citoyen
        $this->notifySignalementUpdate($signalement);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour',
            'data' => $signalement
        ]);
    }

    /**
     * Récupération des notifications pour un utilisateur
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markNotificationRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);
        
        $notification->update(['lu' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue'
        ]);
    }

    /**
     * Récupération des communications pour un signalement
     */
    public function getCommunications(Request $request, $signalementId)
    {
        $signalement = Signalement::findOrFail($signalementId);
        $user = $request->user();

        // Vérifier les permissions
        if ($signalement->citoyen_id !== $user->id && 
            $signalement->agent_assigne_id !== $user->id && 
            !in_array($user->role, ['admin', 'superviseur'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $communications = Communication::where('signalement_id', $signalementId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $communications
        ]);
    }

    /**
     * Envoyer un message dans une communication
     */
    public function sendMessage(Request $request, $signalementId)
    {
        $signalement = Signalement::findOrFail($signalementId);
        $user = $request->user();

        // Vérifier les permissions
        if ($signalement->citoyen_id !== $user->id && 
            $signalement->agent_assigne_id !== $user->id && 
            !in_array($user->role, ['admin', 'superviseur'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'contenu' => 'required|string|max:500',
            'type' => 'nullable|string|in:message,appel'
        ]);

        $communication = Communication::create([
            'signalement_id' => $signalementId,
            'user_id' => $user->id,
            'type' => $request->type ?? 'message',
            'contenu' => $request->contenu,
            'envoyeur' => $user->role === 'citoyen' ? 'citoyen' : 'agent',
            'lu' => false
        ]);

        // Notifier le destinataire
        $this->notifyNewMessage($communication, $signalement);

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé',
            'data' => $communication->load('user')
        ]);
    }

    /**
     * Récupération des positions des agents (pour superviseurs/admin)
     */
    public function getAgentPositions(Request $request)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin', 'superviseur'])) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $agents = AgentTracking::with('agent')
            ->where('is_online', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $agents
        ]);
    }

    /**
     * Récupération des zones de danger
     */
    public function getDangerZones(Request $request)
    {
        $zones = ZoneDanger::orderBy('niveau_risque', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $zones
        ]);
    }

    /**
     * Upload de médias pour un signalement
     */
    public function uploadMedia(Request $request, $signalementId)
    {
        $signalement = Signalement::findOrFail($signalementId);
        $user = $request->user();

        // Vérifier les permissions
        if ($signalement->citoyen_id !== $user->id && 
            $signalement->agent_assigne_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        $request->validate([
            'media' => 'required|file|mimes:jpg,jpeg,png,mp4,avi,mov,wav,mp3|max:10240',
            'type' => 'required|string|in:photo,video,audio'
        ]);

        $media = $this->handleMediaUpload([$request->file('media')], $signalementId, $request->type);

        return response()->json([
            'success' => true,
            'message' => 'Média uploadé avec succès',
            'data' => $media
        ]);
    }

    // Méthodes privées utilitaires

    private function determinerNiveau($priorite)
    {
        return match($priorite) {
            'critique' => 'danger-critical',
            'haute' => 'danger-critical',
            'moyenne' => 'danger-medium',
            'basse' => 'danger-low',
            default => 'danger-medium'
        };
    }

    private function assignerAgentAutomatiquement($signalement)
    {
        $agents = User::where('role', 'agent')
            ->where('statut', 'actif')
            ->get();

        $meilleurAgent = null;
        $meilleurScore = -1;

        foreach ($agents as $agent) {
            $tracking = AgentTracking::where('agent_id', $agent->id)->first();
            if (!$tracking || !$tracking->is_online) continue;

            $distance = $this->calculerDistance(
                $signalement->latitude, $signalement->longitude,
                $tracking->latitude, $tracking->longitude
            );

            // Score basé sur la distance, spécialités, expérience et charge de travail
            $score = $this->calculerScoreAgent($agent, $distance, $signalement->type);
            
            if ($score > $meilleurScore) {
                $meilleurScore = $score;
                $meilleurAgent = $agent;
            }
        }

        return $meilleurAgent;
    }

    private function calculerDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Rayon de la Terre en km
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        
        return $earthRadius * $c;
    }

    private function calculerScoreAgent($agent, $distance, $typeSignalement)
    {
        $score = 0;
        
        // Score basé sur la distance (plus proche = meilleur score)
        $score += max(0, 100 - ($distance * 10));
        
        // Bonus pour les spécialités
        if ($agent->specialites && in_array($typeSignalement, $agent->specialites)) {
            $score += 30;
        }
        
        // Bonus pour l'expérience
        $score += $agent->experience ?? 0;
        
        // Malus pour la charge de travail
        $score -= ($agent->charge_travail ?? 0) * 5;
        
        return $score;
    }

    private function handleMediaUpload($files, $signalementId, $type = null)
    {
        $uploadedMedia = [];
        
        foreach ($files as $file) {
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->store('public/medias');
            
            $media = Media::create([
                'signalement_id' => $signalementId,
                'nom_fichier' => $filename,
                'chemin' => $path,
                'type' => $type ?? $this->determinerTypeMedia($file->getMimeType()),
                'taille' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);
            
            $uploadedMedia[] = $media;
        }
        
        return $uploadedMedia;
    }

    private function determinerTypeMedia($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) return 'photo';
        if (str_starts_with($mimeType, 'video/')) return 'video';
        if (str_starts_with($mimeType, 'audio/')) return 'audio';
        return 'autre';
    }

    private function notifyLocationUpdate($user, $tracking)
    {
        // Notifier les superviseurs de la mise à jour de position
        $superviseurs = User::where('role', 'superviseur')->get();
        
        foreach ($superviseurs as $superviseur) {
            Notification::create([
                'user_id' => $superviseur->id,
                'titre' => 'Mise à jour position agent',
                'message' => "Agent {$user->nom} {$user->prenom} - Position mise à jour",
                'type' => 'info',
                'donnees' => [
                    'agent_id' => $user->id,
                    'latitude' => $tracking->latitude,
                    'longitude' => $tracking->longitude
                ]
            ]);
        }
    }

    private function notifyNewSignalement($signalement)
    {
        $superviseurs = User::where('role', 'superviseur')->get();
        
        foreach ($superviseurs as $superviseur) {
            Notification::create([
                'user_id' => $superviseur->id,
                'titre' => 'Nouveau signalement',
                'message' => "Nouveau signalement de {$signalement->type} - Priorité {$signalement->priorite}",
                'type' => 'error',
                'donnees' => ['signalement_id' => $signalement->id],
                'action_url' => "/signalements/{$signalement->id}"
            ]);
        }
    }

    private function notifySignalementUpdate($signalement)
    {
        Notification::create([
            'user_id' => $signalement->citoyen_id,
            'titre' => 'Mise à jour signalement',
            'message' => "Votre signalement est maintenant {$signalement->status}",
            'type' => 'info',
            'donnees' => ['signalement_id' => $signalement->id]
        ]);
    }

    private function notifyNewMessage($communication, $signalement)
    {
        $destinataireId = $communication->envoyeur === 'citoyen' 
            ? $signalement->agent_assigne_id 
            : $signalement->citoyen_id;
            
        if ($destinataireId) {
            Notification::create([
                'user_id' => $destinataireId,
                'titre' => 'Nouveau message',
                'message' => "Nouveau message reçu",
                'type' => 'info',
                'donnees' => [
                    'signalement_id' => $signalement->id,
                    'communication_id' => $communication->id
                ]
            ]);
        }
    }
}

