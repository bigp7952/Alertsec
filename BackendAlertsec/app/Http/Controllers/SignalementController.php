<?php

namespace App\Http\Controllers;

use App\Models\Signalement;
use App\Models\User;
use App\Models\AgentTracking;
use App\Models\Media;
use App\Models\Communication;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SignalementController extends Controller
{
    public function index(Request $request)
    {
        $query = Signalement::with(['citoyen', 'agentAssigne', 'mediasFiles']);

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('niveau')) {
            $query->where('niveau', $request->niveau);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_assigne_id', $request->agent_id);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_signalement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_signalement', '<=', $request->date_fin);
        }

        // Recherche géographique
        if ($request->filled('latitude') && $request->filled('longitude') && $request->filled('rayon')) {
            $query->dansZone($request->latitude, $request->longitude, $request->rayon);
        }

        $signalements = $query->orderBy('date_signalement', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $signalements
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'description' => 'required|string|max:1000',
            'niveau' => 'required|in:danger-critical,danger-medium,safe-zone',
            'type' => 'required|in:agression,vol,accident,incendie,autre',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'adresse' => 'required|string|max:255',
            'heure' => 'required|date_format:H:i:s',
            'contact' => 'nullable|array',
            'contact.telephone' => 'nullable|string',
            'contact.email' => 'nullable|email',
            'medias' => 'nullable|array',
            'medias.photos' => 'nullable|array',
            'medias.photos.*' => 'image|max:10240', // 10MB max
            'medias.videos' => 'nullable|array',
            'medias.videos.*' => 'mimes:mp4,avi,mov|max:51200', // 50MB max
            'medias.audios' => 'nullable|array',
            'medias.audios.*' => 'mimes:mp3,wav,m4a|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $signalement = Signalement::create([
            'citoyen_id' => $user->id,
            'description' => $request->description,
            'niveau' => $request->niveau,
            'type' => $request->type,
            'priorite' => $this->calculerPriorite($request->all()),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'adresse' => $request->adresse,
            'heure' => $request->heure,
            'date_signalement' => now(),
            'contact' => $request->contact,
            'medias' => $request->medias ?? ['photos' => [], 'videos' => [], 'audios' => []],
        ]);

        // Traitement des médias
        if ($request->hasFile('medias.photos')) {
            foreach ($request->file('medias.photos') as $photo) {
                Media::creerMedia($signalement->id, $photo, 'photo');
            }
        }

        if ($request->hasFile('medias.videos')) {
            foreach ($request->file('medias.videos') as $video) {
                Media::creerMedia($signalement->id, $video, 'video');
            }
        }

        if ($request->hasFile('medias.audios')) {
            foreach ($request->file('medias.audios') as $audio) {
                Media::creerMedia($signalement->id, $audio, 'audio');
            }
        }

        // Notifier les superviseurs et admins
        $this->notifierNouveauSignalement($signalement);

        // Assignation automatique si possible
        $this->assignerAutomatiquement($signalement);

        return response()->json([
            'success' => true,
            'message' => 'Signalement créé avec succès',
            'data' => $signalement->load(['citoyen', 'mediasFiles'])
        ], 201);
    }

    public function show($id)
    {
        $signalement = Signalement::with([
            'citoyen', 
            'agentAssigne', 
            'mediasFiles', 
            'communications.user'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $signalement
        ]);
    }

    public function update(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur() && 
            $signalement->citoyen_id !== $user->id && 
            $signalement->agent_assigne_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à modifier ce signalement'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'sometimes|string|max:1000',
            'status' => 'sometimes|in:non traité,en cours,traité',
            'notes_agent' => 'nullable|string',
            'notes_superviseur' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $signalement->update($request->only([
            'description', 'status', 'notes_agent', 'notes_superviseur'
        ]));

        // Si marqué comme traité, mettre à jour les dates
        if ($request->status === 'traité') {
            $signalement->marquerCommeTraite($request->notes_agent);
        }

        return response()->json([
            'success' => true,
            'message' => 'Signalement mis à jour avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
        ]);
    }

    public function assigner(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions (seuls admin/superviseur peuvent assigner)
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à assigner des signalements'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'agent_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $agent = User::findOrFail($request->agent_id);

        // Vérifier que l'agent peut traiter ce type de signalement
        if ($agent->specialites && !in_array($signalement->type, $agent->specialites)) {
            return response()->json([
                'success' => false,
                'message' => 'Cet agent ne peut pas traiter ce type de signalement'
            ], 400);
        }

        // Vérifier la charge de travail
        if ($agent->charge_travail >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Cet agent a déjà trop de signalements en cours'
            ], 400);
        }

        $signalement->assignerAgent($request->agent_id);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigné avec succès',
            'data' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles'])
        ]);
    }

    public function assignationAutomatique(Request $request, $id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = $request->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && !$user->isSuperviseur()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $agentRecommandé = $this->trouverMeilleurAgent($signalement);

        if (!$agentRecommandé) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun agent disponible trouvé'
            ], 404);
        }

        $signalement->assignerAgent($agentRecommandé->id);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigné automatiquement',
            'data' => [
                'signalement' => $signalement->load(['citoyen', 'agentAssigne', 'mediasFiles']),
                'agent_recommande' => $agentRecommandé
            ]
        ]);
    }

    public function destroy($id)
    {
        $signalement = Signalement::findOrFail($id);
        $user = request()->user();

        // Seuls admin et le créateur peuvent supprimer
        if (!$user->isAdmin() && $signalement->citoyen_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé à supprimer ce signalement'
            ], 403);
        }

        // Supprimer les médias associés
        foreach ($signalement->mediasFiles as $media) {
            Storage::delete($media->chemin_fichier);
            $media->delete();
        }

        $signalement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Signalement supprimé avec succès'
        ]);
    }

    public function statistiques(Request $request)
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

        $statistiques = [
            'total' => $signalements->count(),
            'par_status' => $signalements->groupBy('status')->map->count(),
            'par_niveau' => $signalements->groupBy('niveau')->map->count(),
            'par_type' => $signalements->groupBy('type')->map->count(),
            'par_priorite' => $signalements->groupBy('priorite')->map->count(),
            'taux_traitement' => $signalements->count() > 0 ? 
                round(($signalements->where('status', 'traité')->count() / $signalements->count()) * 100, 2) : 0,
            'temps_moyen_traitement' => $this->calculerTempsMoyenTraitement($signalements),
        ];

        return response()->json([
            'success' => true,
            'data' => $statistiques
        ]);
    }

    // Méthodes privées
    private function calculerPriorite($data)
    {
        $score = 0;
        
        // Niveau de danger
        switch ($data['niveau']) {
            case 'danger-critical':
                $score += 40;
                break;
            case 'danger-medium':
                $score += 20;
                break;
            case 'safe-zone':
                $score += 5;
                break;
        }
        
        // Type de signalement
        switch ($data['type']) {
            case 'agression':
                $score += 30;
                break;
            case 'vol':
                $score += 25;
                break;
            case 'accident':
                $score += 20;
                break;
            case 'incendie':
                $score += 35;
                break;
            default:
                $score += 10;
                break;
        }
        
        // Déterminer la priorité
        if ($score >= 70) return 'critique';
        if ($score >= 50) return 'haute';
        if ($score >= 30) return 'moyenne';
        return 'basse';
    }

    private function notifierNouveauSignalement($signalement)
    {
        $superviseurs = User::whereIn('role', ['admin', 'superviseur'])->get();
        
        foreach ($superviseurs as $superviseur) {
            Notification::create([
                'user_id' => $superviseur->id,
                'titre' => 'Nouveau signalement',
                'message' => "Un signalement de type {$signalement->type} a été créé",
                'type' => $signalement->niveau === 'danger-critical' ? 'error' : 'info',
                'donnees' => ['signalement_id' => $signalement->id],
                'action_url' => "/signalements/{$signalement->id}",
            ]);
        }
    }

    private function assignerAutomatiquement($signalement)
    {
        $agentRecommandé = $this->trouverMeilleurAgent($signalement);
        
        if ($agentRecommandé) {
            $signalement->assignerAgent($agentRecommandé->id);
        }
    }

    private function trouverMeilleurAgent($signalement)
    {
        $agents = User::agents()
            ->disponibles()
            ->get();

        $meilleursAgents = collect();

        foreach ($agents as $agent) {
            $dernierePosition = $agent->dernierePosition;
            if (!$dernierePosition) continue;

            // Vérifier les spécialités
            if ($agent->specialites && !in_array($signalement->type, $agent->specialites)) {
                continue;
            }

            // Calculer la distance
            $distance = $agent->calculerDistance($signalement->latitude, $signalement->longitude);
            if ($distance > $agent->distance_max) {
                continue;
            }

            // Calculer le score
            $score = 100;
            $score -= $distance * 5; // Pénalité distance
            $score -= $agent->charge_travail * 10; // Pénalité charge
            $score += $agent->experience * 2; // Bonus expérience
            $score += $agent->taux_reussite ?? 0; // Bonus taux de réussite

            $meilleursAgents->push([
                'agent' => $agent,
                'score' => $score,
                'distance' => $distance
            ]);
        }

        return $meilleursAgents->sortByDesc('score')->first()['agent'] ?? null;
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
}
